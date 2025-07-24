import { PrismaClient } from '@prisma/client';
import { 
  BillStatistics, 
  CategorySummary, 
  MonthlyData, 
  AccountBalance, 
  StatisticsQuery 
} from './types';

export class StatisticsService {
  constructor(private prisma: PrismaClient) {}

  async getBillStatistics(query: StatisticsQuery): Promise<BillStatistics> {
    const { userId, dateRange, categoryIds, accountIds, billTypes } = query;

    // 构建查询条件
    const whereClause: Record<string, unknown> = {
      userId,
      ...(dateRange && {
        date: {
          gte: dateRange.startDate,
          lte: dateRange.endDate
        }
      }),
      ...(categoryIds && {
        categoryId: { in: categoryIds }
      }),
      ...(accountIds && {
        accountId: { in: accountIds }
      }),
      ...(billTypes && {
        type: { in: billTypes }
      })
    };

    // 获取所有账单
    const bills = await this.prisma.bill.findMany({
      where: whereClause,
      include: {
        category: true,
        account: true
      }
    });

    // 计算基本统计信息
    const totalIncome = bills
      .filter(bill => bill.type === 'INCOME')
      .reduce((sum, bill) => sum + bill.amount, 0);

    const totalExpense = bills
      .filter(bill => bill.type === 'EXPENSE')
      .reduce((sum, bill) => sum + bill.amount, 0);

    const totalInvestment = bills
      .filter(bill => bill.type === 'INVESTMENT')
      .reduce((sum, bill) => sum + bill.amount, 0);

    const netIncome = totalIncome - totalExpense;
    const transactionCount = bills.length;
    const averageTransaction = transactionCount > 0 ? 
      bills.reduce((sum, bill) => sum + bill.amount, 0) / transactionCount : 0;

    // 分类统计
    const billsWithCategory = bills.filter(bill => bill.categoryId !== null);
    const categoryBreakdown = await this.getCategoryBreakdown(billsWithCategory);

    // 月度趋势
    const monthlyTrend = await this.getMonthlyTrend(bills);

    // 账户余额
    const accountBalances = await this.getAccountBalances(userId);

    return {
      totalIncome,
      totalExpense,
      totalInvestment,
      netIncome,
      transactionCount,
      averageTransaction,
      categoryBreakdown,
      monthlyTrend,
      accountBalances
    };
  }

  private async getCategoryBreakdown(bills: Array<{ categoryId: string | null; category?: { name: string } | null; amount: number; type: string }>): Promise<CategorySummary[]> {
    const categoryMap = new Map<string, {
      name: string;
      amount: number;
      count: number;
      type: string;
    }>();

    bills.forEach((bill: { categoryId: string | null; category?: { name: string } | null; amount: number; type: string }) => {
      const categoryId = bill.categoryId || 'uncategorized';
      const categoryName = bill.category?.name || '未分类';
      
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          name: categoryName,
          amount: 0,
          count: 0,
          type: bill.type
        });
      }
      
      const category = categoryMap.get(categoryId)!;
      category.amount += bill.amount;
      category.count += 1;
    });

    const totalAmount = Array.from(categoryMap.values())
      .reduce((sum, cat) => sum + cat.amount, 0);

    return Array.from(categoryMap.entries()).map(([categoryId, data]) => ({
      categoryId,
      categoryName: data.name,
      amount: data.amount,
      count: data.count,
      percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
      type: data.type as 'INCOME' | 'EXPENSE' | 'INVESTMENT' | 'TRANSFER'
    }));
  }

  private async getMonthlyTrend(bills: Array<{ date: Date; amount: number; type: string }>): Promise<MonthlyData[]> {
    const monthlyMap = new Map<string, {
      income: number;
      expense: number;
      investment: number;
    }>();

    bills.forEach((bill: { date: Date; amount: number; type: string }) => {
      const month = bill.date.toISOString().slice(0, 7); // YYYY-MM
      
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, { income: 0, expense: 0, investment: 0 });
      }
      
      const monthData = monthlyMap.get(month)!;
      
      switch (bill.type) {
        case 'INCOME':
          monthData.income += bill.amount;
          break;
        case 'EXPENSE':
          monthData.expense += bill.amount;
          break;
        case 'INVESTMENT':
          monthData.investment += bill.amount;
          break;
      }
    });

    return Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
        investment: data.investment,
        net: data.income - data.expense
      }));
  }

  private async getAccountBalances(userId: string): Promise<AccountBalance[]> {
    const accounts = await this.prisma.account.findMany({
      where: { userId },
      include: {
        bills: true
      }
    });

    return accounts.map(account => ({
      accountId: account.id,
      accountName: account.name,
      balance: account.balance,
      type: account.type
    }));
  }

  async getTopCategories(
    userId: string, 
    limit: number = 10,
    billType?: 'INCOME' | 'EXPENSE' | 'INVESTMENT'
  ): Promise<CategorySummary[]> {
    const whereClause: Record<string, unknown> = {
      userId,
      ...(billType && { type: billType })
    };

    const bills = await this.prisma.bill.findMany({
      where: whereClause,
      include: { category: true }
    });

    const categoryBreakdown = await this.getCategoryBreakdown(bills);
    
    return categoryBreakdown
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit);
  }
}