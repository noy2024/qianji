export interface ParsedBillData {
  title: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'INVESTMENT' | 'TRANSFER';
  description?: string;
  date: Date;
  category?: string;
  account?: string;
  platform?: string;
  originalData?: Record<string, unknown>;
}

export interface BillParser {
  canParse(file: File | string): boolean;
  parse(data: ArrayBuffer | string): Promise<ParsedBillData[]>;
  getPlatform(): string;
}

export interface CSVMapping {
  dateColumn: string;
  amountColumn: string;
  descriptionColumn: string;
  typeColumn?: string;
  categoryColumn?: string;
  accountColumn?: string;
}