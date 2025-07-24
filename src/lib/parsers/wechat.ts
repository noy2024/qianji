import { ParsedBillData, BillParser } from './types';
import { CategorizationService } from '../services/categorization';

export class WeChatParser implements BillParser {
  private categorizationService: CategorizationService;

  constructor() {
    this.categorizationService = new CategorizationService();
  }

  canParse(file: File): boolean {
    return file.name.includes('微信') || file.name.includes('wechat');
  }

  async parse(data: ArrayBuffer): Promise<ParsedBillData[]> {
    const text = new TextDecoder('utf-8').decode(data);
    const lines = text.split('\n').filter(line => line.trim());

    const headerIndex = lines.findIndex(line => line.includes('交易时间'));
    if (headerIndex === -1) throw new Error('无效的微信账单格式');

    const headers = lines[headerIndex].split(',').map(h => h.trim().replace(/"/g, ''));
    const dataLines = lines.slice(headerIndex + 1);

    const requiredColumns = ['交易对方', '商品', '金额(元)', '收/支', '当前状态', '交易时间'];
    const columnIndices: { [key: string]: number } = {};

    requiredColumns.forEach(col => {
      const index = headers.indexOf(col);
      if (index === -1) throw new Error(`无效的微信账单格式：找不到列 ${col}`);
      columnIndices[col] = index;
    });

    return dataLines.map(line => {
      const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));

      return {
        title: columns[columnIndices['交易对方']] || '微信支付',
        amount: Math.abs(parseFloat(columns[columnIndices['金额(元)']]) || 0),
        type: this.determineType(columns[columnIndices['收/支']], parseFloat(columns[columnIndices['金额(元)']])),
        description: `${columns[columnIndices['交易对方']]} - ${columns[columnIndices['商品']]} `,
        date: this.parseDate(columns[columnIndices['交易时间']]),
        category: this.categorizeTransaction(columns[columnIndices['商品']]),
        platform: 'wechat',
        originalData: { rawColumns: columns }
      };
    });
  }

  private determineType(status: string, amount: number): 'INCOME' | 'EXPENSE' | 'TRANSFER' {
    if (status.includes('转账')) return 'TRANSFER';
    if (status.includes('支出')) return 'EXPENSE';
    if (status.includes('收入')) return 'INCOME';
    return amount > 0 ? 'INCOME' : 'EXPENSE';
  }

  private parseDate(dateStr: string): Date {
    // 微信格式: 2024-01-01 12:00:00
    return new Date(dateStr);
  }

  private categorizeTransaction(description: string): string {
    const categoryMap: { [key: string]: string } = {
      '餐饮': '餐饮美食',
      '超市': '日用百货',
      '打车': '交通出行',
      '充值': '充值缴费',
      '转账': '转账',
      '红包': '红包',
      '理财': '投资理财'
    };

    for (const [keyword, category] of Object.entries(categoryMap)) {
      if (description.includes(keyword)) {
        return category;
      }
    }
    
    return '其他';
  }

  getPlatform(): string {
    return 'wechat';
  }
}