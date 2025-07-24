import { ParsedBillData, BillParser } from './types';
import { CategorizationService } from '../services/categorization';

export class AlipayParser implements BillParser {
  private categorizationService: CategorizationService;

  constructor() {
    this.categorizationService = new CategorizationService();
  }
  canParse(file: File): boolean {
    return file.name.includes('支付宝') || file.name.includes('alipay');
  }

  async parse(data: ArrayBuffer): Promise<ParsedBillData[]> {
    const text = new TextDecoder('gbk').decode(data); // 支付宝通常使用GBK编码
    const lines = text.split('\n').filter(line => line.trim());
    
    // 改进表头识别逻辑 - 寻找包含关键列名的行
    const headerIndex = lines.findIndex(line => {
      const lowerLine = line.toLowerCase();
      return (line.includes('付款时间') || line.includes('交易时间')) && 
             (line.includes('交易对方') || line.includes('商户')) &&
             (line.includes('金额') || line.includes('收/支'));
    });
    
    if (headerIndex === -1) {
      // 如果还是找不到，尝试更宽松的匹配
      const fallbackIndex = lines.findIndex(line => 
        line.includes('时间') && line.includes('金额') && line.split(',').length > 5
      );
      if (fallbackIndex === -1) {
        throw new Error('无效的支付宝账单格式');
      }
      console.log('使用备用表头识别，行号:', fallbackIndex, '内容:', lines[fallbackIndex]);
    }
    
    const actualHeaderIndex = headerIndex !== -1 ? headerIndex : lines.findIndex(line => 
      line.includes('时间') && line.includes('金额') && line.split(',').length > 5
    );

    const headers = lines[actualHeaderIndex].split(',').map(h => h.trim().replace(/"/g, ''));
    const dataLines = lines.slice(actualHeaderIndex + 1).filter(line => 
      line.trim() && 
      !line.startsWith('---') && 
      !line.includes('支付宝') &&
      line.split(',').length >= headers.length - 2 // 允许一些列为空
    );

    // 动态映射列名
    const findColumnIndex = (possibleNames: string[]): number => {
      for (const name of possibleNames) {
        const index = headers.findIndex(h => h.includes(name));
        if (index !== -1) return index;
      }
      return -1;
    };
    
    const columnIndices: { [key: string]: number } = {
      '付款时间': findColumnIndex(['付款时间', '交易时间', '时间']),
      '交易对方': findColumnIndex(['交易对方', '商户', '对方']),
      '商品说明': findColumnIndex(['商品说明', '商品名称', '商品', '说明']),
      '金额': findColumnIndex(['金额']),
      '收/支': findColumnIndex(['收/支', '类型']),
      '交易状态': findColumnIndex(['交易状态', '状态'])
    };
    
    // 检查必需的列是否存在
    const requiredColumns = ['付款时间', '金额', '收/支'];
    for (const col of requiredColumns) {
      if (columnIndices[col] === -1) {
        throw new Error(`无效的支付宝账单格式：找不到列 ${col}`);
      }
    }

    console.log('表头:', headers);
    console.log('列索引:', columnIndices);

    return dataLines.map((line, index) => {
      try {
        const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
        
        // 跳过无效行
        if (columns.length < 6 || !columns[columnIndices['付款时间']]) {
          return null;
        }

        const amountStr = columns[columnIndices['金额']] || '0';
        const amount = parseFloat(amountStr.replace(/[^\d.-]/g, '')) || 0;
        const paymentStatus = columns[columnIndices['收/支']] || '';
        const transactionParty = columns[columnIndices['交易对方']] || '';
        const description = columns[columnIndices['商品说明']] || transactionParty || '支付宝交易';
        
        return {
          title: description,
          amount: Math.abs(amount),
          type: this.determineType(paymentStatus, amount),
          description: `${transactionParty} - ${description}`,
          date: this.parseDate(columns[columnIndices['付款时间']]),
          category: this.categorizationService.categorize(description || transactionParty),
          platform: 'alipay',
          originalData: { rawColumns: columns }
        };
      } catch (error) {
        console.warn(`解析第${index + 1}行数据时出错:`, error, line);
        return null;
      }
    }).filter(item => item !== null) as ParsedBillData[];
  }

  private determineType(status: string, amount: number): 'INCOME' | 'EXPENSE' | 'TRANSFER' {
    if (status.includes('转账') || status.includes('转入') || status.includes('转出')) {
      return 'TRANSFER';
    }
    if (status.includes('收入') || status.includes('收款') || (status.includes('收') && !status.includes('支'))) {
      return 'INCOME';
    }
    return 'EXPENSE';
  }

  private parseDate(dateStr: string): Date {
    // 支付宝格式: 2024-01-01 12:00:00
    try {
      return new Date(dateStr);
    } catch (error) {
      console.warn('日期解析失败:', dateStr);
      return new Date();
    }
  }

  getPlatform(): string {
    return 'alipay';
  }
}