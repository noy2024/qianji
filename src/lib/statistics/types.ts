export interface BillStatistics {
  totalIncome: number;
  totalExpense: number;
  totalInvestment: number;
  netIncome: number;
  transactionCount: number;
  averageTransaction: number;
  categoryBreakdown: CategorySummary[];
  monthlyTrend: MonthlyData[];
  accountBalances: AccountBalance[];
}

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  amount: number;
  count: number;
  percentage: number;
  type: 'INCOME' | 'EXPENSE' | 'INVESTMENT' | 'TRANSFER';
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  investment: number;
  net: number;
}

export interface AccountBalance {
  accountId: string;
  accountName: string;
  balance: number;
  type: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface StatisticsQuery {
  userId: string;
  dateRange?: DateRange;
  categoryIds?: string[];
  accountIds?: string[];
  billTypes?: ('INCOME' | 'EXPENSE' | 'INVESTMENT' | 'TRANSFER')[];
}