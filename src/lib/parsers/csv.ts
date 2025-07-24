import { ParsedBillData, BillParser, CSVMapping } from './types';

export class GenericCSVParser implements BillParser {
  private mapping: CSVMapping;

  constructor(mapping: CSVMapping) {
    this.mapping = mapping;
  }

  canParse(file: File): boolean {
    return file.name.endsWith('.csv') || file.type === 'text/csv';
  }

  async parse(data: ArrayBuffer): Promise<ParsedBillData[]> {
    const text = new TextDecoder('utf-8').decode(data);
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) throw new Error('CSV文件格式错误');
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const dataLines = lines.slice(1);
    
    return dataLines.map(line => {
      const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
      const rowData: { [key: string]: string } = {};
      
      headers.forEach((header, index) => {
        rowData[header] = columns[index] || '';
      });
      
      return {
        title: rowData[this.mapping.descriptionColumn] || '导入交易',
        amount: Math.abs(parseFloat(rowData[this.mapping.amountColumn]) || 0),
        type: this.determineType(rowData),
        description: rowData[this.mapping.descriptionColumn] || '',
        date: this.parseDate(rowData[this.mapping.dateColumn]),
        category: this.mapping.categoryColumn ? (rowData[this.mapping.categoryColumn] || '其他') : '其他',
        account: this.mapping.accountColumn ? (rowData[this.mapping.accountColumn] || undefined) : undefined,
        platform: 'csv',
        originalData: rowData
      };
    });
  }

  private determineType(rowData: { [key: string]: string }): 'INCOME' | 'EXPENSE' | 'TRANSFER' {
    if (this.mapping.typeColumn && rowData[this.mapping.typeColumn]) {
      const type = rowData[this.mapping.typeColumn].toLowerCase();
      if (type.includes('income') || type.includes('收入')) return 'INCOME';
      if (type.includes('transfer') || type.includes('转账')) return 'TRANSFER';
    }
    
    const amount = parseFloat(rowData[this.mapping.amountColumn]);
    return amount >= 0 ? 'INCOME' : 'EXPENSE';
  }

  private parseDate(dateStr: string): Date {
    // 尝试多种日期格式
    const formats = [
      /^\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}/, // MM/DD/YYYY
      /^\d{2}-\d{2}-\d{4}/, // MM-DD-YYYY
    ];
    
    return new Date(dateStr);
  }

  getPlatform(): string {
    return 'csv';
  }
}