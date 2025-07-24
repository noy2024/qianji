import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 财务健康度评分接口
export interface FinancialHealthScore {
  score: number; // 0-100分
  level: 'excellent' | 'good' | 'fair' | 'poor';
  factors: {
    incomeStability: number; // 收入稳定性
    expenseControl: number; // 支出控制
    savingsRate: number; // 储蓄率
    debtRatio: number; // 负债率
  };
  suggestions: string[];
}

// 支出结构分析接口
export interface ExpenseAnalysis {
  categories: {
    name: string;
    amount: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
    suggestion?: string;
  }[];
  totalExpense: number;
  averageDaily: number;
  topCategories: string[];
  unusualSpending: {
    category: string;
    amount: number;
    reason: string;
  }[];
}

// 收入趋势预测接口
export interface IncomeForecast {
  currentMonthly: number;
  predictedNext3Months: number[];
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number; // 0-1
  factors: string[];
  recommendations: string[];
}

// AI建议接口
export interface AIRecommendation {
  id: string;
  type: 'expense_reduction' | 'income_increase' | 'investment' | 'savings';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedSavings?: number;
  timeframe: string;
  priority: number;
}

/**
 * 计算财务健康度评分
 */
export async function calculateFinancialHealthScore(userId?: string): Promise<FinancialHealthScore> {
  try {
    // 获取最近3个月的财务数据
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const bills = await prisma.bill.findMany({
      where: {
        date: {
          gte: threeMonthsAgo
        }
      },
      include: {
        category: true
      }
    });

    // 计算收入和支出
    const income = bills
      .filter(bill => bill.type === 'INCOME')
      .reduce((sum, bill) => sum + bill.amount, 0);
    
    const expenses = bills
      .filter(bill => bill.type === 'EXPENSE')
      .reduce((sum, bill) => sum + Math.abs(bill.amount), 0);

    // 计算各项指标
    const incomeStability = calculateIncomeStability(bills);
    const expenseControl = calculateExpenseControl(bills);
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
    const debtRatio = 0; // 暂时设为0，后续可以从账户余额计算

    // 计算综合评分
    const score = Math.round(
      (incomeStability * 0.25 + 
       expenseControl * 0.25 + 
       Math.min(savingsRate * 2, 100) * 0.3 + 
       Math.max(100 - debtRatio, 0) * 0.2)
    );

    // 确定等级
    let level: 'excellent' | 'good' | 'fair' | 'poor';
    if (score >= 80) level = 'excellent';
    else if (score >= 60) level = 'good';
    else if (score >= 40) level = 'fair';
    else level = 'poor';

    // 生成建议
    const suggestions = generateHealthSuggestions({
      incomeStability,
      expenseControl,
      savingsRate,
      debtRatio
    });

    return {
      score,
      level,
      factors: {
        incomeStability,
        expenseControl,
        savingsRate,
        debtRatio
      },
      suggestions
    };
  } catch (error) {
    console.error('计算财务健康度评分失败:', error);
    throw new Error('财务健康度评分计算失败');
  }
}

/**
 * 分析支出结构
 */
export async function analyzeExpenseStructure(userId?: string): Promise<ExpenseAnalysis> {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const bills = await prisma.bill.findMany({
      where: {
        type: 'EXPENSE',
        date: {
          gte: oneMonthAgo
        }
      },
      include: {
        category: true
      }
    });

    // 按分类统计支出
    const categoryStats = new Map<string, { amount: number; count: number }>();
    let totalExpense = 0;

    bills.forEach(bill => {
      const categoryName = bill.category?.name || '未分类';
      const amount = Math.abs(bill.amount);
      totalExpense += amount;

      if (categoryStats.has(categoryName)) {
        const stats = categoryStats.get(categoryName)!;
        stats.amount += amount;
        stats.count += 1;
      } else {
        categoryStats.set(categoryName, { amount, count: 1 });
      }
    });

    // 转换为数组并计算百分比
    const categories = Array.from(categoryStats.entries()).map(([name, stats]) => ({
      name,
      amount: stats.amount,
      percentage: totalExpense > 0 ? (stats.amount / totalExpense) * 100 : 0,
      trend: 'stable' as const, // 暂时设为stable，后续可以通过历史数据计算趋势
      suggestion: generateCategorySuggestion(name, stats.amount, totalExpense)
    }));

    // 按金额排序
    categories.sort((a, b) => b.amount - a.amount);

    const averageDaily = totalExpense / 30;
    const topCategories = categories.slice(0, 3).map(cat => cat.name);
    
    // 识别异常支出（超过平均值2倍的单笔支出）
    const avgBillAmount = totalExpense / bills.length;
    const unusualSpending = bills
      .filter(bill => Math.abs(bill.amount) > avgBillAmount * 2)
      .map(bill => ({
        category: bill.category?.name || '未分类',
        amount: Math.abs(bill.amount),
        reason: '单笔支出异常偏高'
      }));

    return {
      categories,
      totalExpense,
      averageDaily,
      topCategories,
      unusualSpending
    };
  } catch (error) {
    console.error('支出结构分析失败:', error);
    throw new Error('支出结构分析失败');
  }
}

/**
 * 预测收入趋势
 */
export async function forecastIncome(userId?: string): Promise<IncomeForecast> {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const bills = await prisma.bill.findMany({
      where: {
        type: 'INCOME',
        date: {
          gte: sixMonthsAgo
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // 按月统计收入
    const monthlyIncome = new Map<string, number>();
    bills.forEach(bill => {
      const monthKey = `${bill.date.getFullYear()}-${bill.date.getMonth() + 1}`;
      monthlyIncome.set(monthKey, (monthlyIncome.get(monthKey) || 0) + bill.amount);
    });

    const incomeArray = Array.from(monthlyIncome.values());
    const currentMonthly = incomeArray.length > 0 ? incomeArray[incomeArray.length - 1] : 0;

    // 简单的线性趋势预测
    const trend = calculateTrend(incomeArray);
    const predictedNext3Months = predictNextMonths(incomeArray, 3);

    return {
      currentMonthly,
      predictedNext3Months,
      trend,
      confidence: 0.7, // 基础置信度
      factors: ['历史收入趋势', '季节性因素'],
      recommendations: generateIncomeRecommendations(trend, currentMonthly)
    };
  } catch (error) {
    console.error('收入趋势预测失败:', error);
    throw new Error('收入趋势预测失败');
  }
}

/**
 * 生成AI建议
 */
export async function generateAIRecommendations(userId?: string): Promise<AIRecommendation[]> {
  try {
    const [healthScore, expenseAnalysis, incomeForecast] = await Promise.all([
      calculateFinancialHealthScore(userId),
      analyzeExpenseStructure(userId),
      forecastIncome(userId)
    ]);

    const recommendations: AIRecommendation[] = [];

    // 基于财务健康度生成建议
    if (healthScore.score < 60) {
      recommendations.push({
        id: 'improve-health-score',
        type: 'savings',
        title: '提升财务健康度',
        description: '您的财务健康度需要改善，建议优化支出结构并增加储蓄',
        impact: 'high',
        difficulty: 'medium',
        timeframe: '3个月',
        priority: 1
      });
    }

    // 基于支出分析生成建议
    const topExpenseCategory = expenseAnalysis.categories[0];
    if (topExpenseCategory && topExpenseCategory.percentage > 40) {
      recommendations.push({
        id: 'reduce-top-expense',
        type: 'expense_reduction',
        title: `优化${topExpenseCategory.name}支出`,
        description: `${topExpenseCategory.name}占支出比例过高(${topExpenseCategory.percentage.toFixed(1)}%)，建议适当控制`,
        impact: 'medium',
        difficulty: 'easy',
        estimatedSavings: topExpenseCategory.amount * 0.2,
        timeframe: '1个月',
        priority: 2
      });
    }

    // 基于收入趋势生成建议
    if (incomeForecast.trend === 'decreasing') {
      recommendations.push({
        id: 'increase-income',
        type: 'income_increase',
        title: '增加收入来源',
        description: '收入呈下降趋势，建议考虑副业或技能提升',
        impact: 'high',
        difficulty: 'hard',
        timeframe: '6个月',
        priority: 1
      });
    }

    return recommendations.sort((a, b) => a.priority - b.priority);
  } catch (error) {
    console.error('生成AI建议失败:', error);
    throw new Error('AI建议生成失败');
  }
}

// 辅助函数
function calculateIncomeStability(bills: any[]): number {
  const incomes = bills.filter(bill => bill.type === 'INCOME');
  if (incomes.length < 2) return 50;
  
  const amounts = incomes.map(bill => bill.amount);
  const avg = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
  const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - avg, 2), 0) / amounts.length;
  const stability = Math.max(0, 100 - (Math.sqrt(variance) / avg) * 100);
  
  return Math.min(100, stability);
}

function calculateExpenseControl(bills: any[]): number {
  const expenses = bills.filter(bill => bill.type === 'EXPENSE');
  if (expenses.length === 0) return 100;
  
  // 简单的支出控制评分：基于支出的规律性
  const dailyExpenses = new Map<string, number>();
  expenses.forEach(bill => {
    const dateKey = bill.date.toISOString().split('T')[0];
    dailyExpenses.set(dateKey, (dailyExpenses.get(dateKey) || 0) + Math.abs(bill.amount));
  });
  
  const dailyAmounts = Array.from(dailyExpenses.values());
  const avg = dailyAmounts.reduce((sum, amount) => sum + amount, 0) / dailyAmounts.length;
  const variance = dailyAmounts.reduce((sum, amount) => sum + Math.pow(amount - avg, 2), 0) / dailyAmounts.length;
  const control = Math.max(0, 100 - (Math.sqrt(variance) / avg) * 50);
  
  return Math.min(100, control);
}

function generateHealthSuggestions(factors: any): string[] {
  const suggestions: string[] = [];
  
  if (factors.incomeStability < 60) {
    suggestions.push('建议寻找更稳定的收入来源');
  }
  
  if (factors.expenseControl < 60) {
    suggestions.push('建议制定详细的支出预算并严格执行');
  }
  
  if (factors.savingsRate < 20) {
    suggestions.push('建议将储蓄率提升至收入的20%以上');
  }
  
  return suggestions;
}

function generateCategorySuggestion(category: string, amount: number, total: number): string | undefined {
  const percentage = (amount / total) * 100;
  
  if (percentage > 30) {
    return `${category}支出占比较高，建议适当控制`;
  }
  
  return undefined;
}

function calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
  if (values.length < 2) return 'stable';
  
  const first = values[0];
  const last = values[values.length - 1];
  const change = (last - first) / first;
  
  if (change > 0.1) return 'increasing';
  if (change < -0.1) return 'decreasing';
  return 'stable';
}

function predictNextMonths(values: number[], months: number): number[] {
  if (values.length === 0) return new Array(months).fill(0);
  
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const trend = values.length > 1 ? (values[values.length - 1] - values[0]) / values.length : 0;
  
  const predictions: number[] = [];
  for (let i = 1; i <= months; i++) {
    predictions.push(Math.max(0, avg + trend * i));
  }
  
  return predictions;
}

function generateIncomeRecommendations(trend: string, current: number): string[] {
  const recommendations: string[] = [];
  
  if (trend === 'decreasing') {
    recommendations.push('考虑开发副业增加收入');
    recommendations.push('提升专业技能以获得加薪机会');
  } else if (trend === 'stable' && current > 0) {
    recommendations.push('收入稳定，可考虑适当的投资理财');
  }
  
  return recommendations;
}