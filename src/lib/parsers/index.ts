import { BillParser, ParsedBillData } from './types';
import { WeChatParser } from './wechat';
import { AlipayParser } from './alipay';
import { GenericCSVParser } from './csv';

export class BillParserFactory {
  private parsers: BillParser[] = [];

  constructor() {
    this.parsers = [
      new WeChatParser(),
      new AlipayParser(),
      // 通用CSV解析器作为后备
      new GenericCSVParser({
        dateColumn: '日期',
        amountColumn: '金额',
        descriptionColumn: '描述',
        typeColumn: '类型',
        categoryColumn: '分类',
        accountColumn: '账户'
      })
    ];
  }

  async parseFile(file: File): Promise<ParsedBillData[]> {
    const parser = this.findParser(file);
    if (!parser) {
      throw new Error(`不支持的文件格式: ${file.name}`);
    }

    const arrayBuffer = await file.arrayBuffer();
    return parser.parse(arrayBuffer);
  }

  private findParser(file: File): BillParser | null {
    return this.parsers.find(parser => parser.canParse(file)) || null;
  }

  getSupportedFormats(): string[] {
    return [
      '微信支付账单 (.csv)',
      '支付宝账单 (.csv)', 
      '通用CSV格式 (.csv)',
      '银行流水 (.csv)',
      'Excel文件 (.xlsx)'
    ];
  }
}

export * from './types';
export { WeChatParser } from './wechat';
export { AlipayParser } from './alipay';
export { GenericCSVParser } from './csv';