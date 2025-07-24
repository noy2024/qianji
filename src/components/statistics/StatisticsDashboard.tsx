import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { BillStatistics, CategorySummary, MonthlyData } from '@/lib/statistics/types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

export default function StatisticsDashboard() {
  const [stats, setStats] = useState<BillStatistics | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: '2024-01-01',
    endDate: '2024-12-31',
  });

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const fetchStats = async () => {
    try {
      const { startDate, endDate } = dateRange;
      const response = await fetch(
        `/api/statistics?startDate=${startDate}&endDate=${endDate}`
      );
      const data = await response.json();
      
      // Ensure all required properties exist and are properly typed
      if (data && typeof data === 'object') {
        setStats({
          totalIncome: data.totalIncome || 0,
          totalExpense: data.totalExpense || 0,
          totalInvestment: data.totalInvestment || 0,
          netIncome: data.netIncome || 0,
          transactionCount: data.transactionCount || 0,
          averageTransaction: data.averageTransaction || 0,
          categoryBreakdown: Array.isArray(data.spendingByCategory) ? data.spendingByCategory : [],
          monthlyTrend: Array.isArray(data.monthlyData) ? data.monthlyData : [],
          accountBalances: Array.isArray(data.accountBalances) ? data.accountBalances : []
        });
      } else {
        setStats({
          totalIncome: 0,
          totalExpense: 0,
          totalInvestment: 0,
          netIncome: 0,
          transactionCount: 0,
          averageTransaction: 0,
          categoryBreakdown: [],
          monthlyTrend: [],
          accountBalances: []
        });
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      setStats({
        totalIncome: 0,
        totalExpense: 0,
        totalInvestment: 0,
        netIncome: 0,
        transactionCount: 0,
        averageTransaction: 0,
        categoryBreakdown: [],
        monthlyTrend: [],
        accountBalances: []
      });
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg text-gray-600">Loading statistics...</div>
      </div>
    );
  }

  const { 
    totalIncome = 0, 
    totalExpense = 0, 
    netIncome = 0, 
    categoryBreakdown = [], 
    monthlyTrend = [] 
  } = stats || {};

  const expenseCategories = (categoryBreakdown || []).filter(c => c.type === 'EXPENSE');

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">统计仪表盘</h2>

      <div className="mb-8">
        <label>开始日期</label>
        <input 
          type="date" 
          name="startDate" 
          value={dateRange.startDate} 
          onChange={handleDateChange} 
          className="p-2 border rounded"
        />
        <label className="ml-4">结束日期</label>
        <input 
          type="date" 
          name="endDate" 
          value={dateRange.endDate} 
          onChange={handleDateChange} 
          className="p-2 border rounded"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="p-4 bg-green-100 rounded-lg">
          <h3 className="text-lg font-semibold">总收入</h3>
          <p className="text-2xl">¥{totalIncome.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-red-100 rounded-lg">
          <h3 className="text-lg font-semibold">总支出</h3>
          <p className="text-2xl">¥{totalExpense.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-blue-100 rounded-lg">
          <h3 className="text-lg font-semibold">净收入</h3>
          <p className="text-2xl">¥{netIncome.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">按类别划分的支出</h3>
          <PieChart width={400} height={400}>
            <Pie
              data={expenseCategories || []}
              cx={200}
              cy={200}
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="amount"
              nameKey="categoryName"
            >
              {(expenseCategories || []).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `¥${value.toFixed(2)}`} />
            <Legend />
          </PieChart>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4">月度收支趋势</h3>
          <BarChart width={600} height={300} data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value: number) => `¥${value.toFixed(2)}`} />
            <Legend />
            <Bar dataKey="income" fill="#82ca9d" />
            <Bar dataKey="expense" fill="#8884d8" />
          </BarChart>
        </div>
      </div>
    </div>
  );
}
