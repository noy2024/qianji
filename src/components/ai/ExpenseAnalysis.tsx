'use client';

import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';

interface ExpenseAnalysisProps {
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

const ExpenseAnalysis: React.FC<ExpenseAnalysisProps> = ({
  categories,
  totalExpense,
  averageDaily,
  topCategories,
  unusualSpending
}) => {
  // 饼图颜色配置
  const COLORS = [
    '#2563EB', '#F59E0B', '#10B981', '#F97316', '#8B5CF6',
    '#EF4444', '#06B6D4', '#84CC16', '#F472B6', '#6B7280'
  ];

  // 格式化金额
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // 获取趋势图标
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      case 'stable':
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  // 准备饼图数据
  const pieData = categories.slice(0, 8).map((category, index) => ({
    name: category.name,
    value: category.amount,
    percentage: category.percentage,
    color: COLORS[index % COLORS.length]
  }));

  // 准备柱状图数据
  const barData = categories.slice(0, 6).map(category => ({
    name: category.name.length > 6 ? category.name.substring(0, 6) + '...' : category.name,
    amount: category.amount,
    percentage: category.percentage
  }));

  // 自定义饼图标签
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    if (percentage < 5) return null; // 小于5%不显示标签
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${percentage.toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">支出结构分析</h2>
        <div className="text-sm text-gray-600">
          本月总支出: <span className="font-semibold text-gray-900">{formatAmount(totalExpense)}</span>
        </div>
      </div>

      {/* 概览统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">日均支出</div>
          <div className="text-2xl font-bold text-blue-900">{formatAmount(averageDaily)}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium">支出分类</div>
          <div className="text-2xl font-bold text-green-900">{categories.length}个</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="text-sm text-yellow-600 font-medium">最大支出</div>
          <div className="text-2xl font-bold text-yellow-900">
            {categories.length > 0 ? categories[0].name : '无'}
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 饼图 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">支出分布</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [formatAmount(value), '金额']}
                  labelFormatter={(label) => `分类: ${label}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 柱状图 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">主要支出分类</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  fontSize={12}
                  tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => [formatAmount(value), '金额']}
                  labelFormatter={(label) => `分类: ${label}`}
                />
                <Bar dataKey="amount" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 详细分类列表 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">详细分类</h3>
        <div className="space-y-3">
          {categories.slice(0, 8).map((category, index) => (
            <div key={category.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <div>
                  <div className="font-medium text-gray-900">{category.name}</div>
                  {category.suggestion && (
                    <div className="text-xs text-yellow-600 mt-1">{category.suggestion}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{formatAmount(category.amount)}</div>
                  <div className="text-sm text-gray-600">{category.percentage.toFixed(1)}%</div>
                </div>
                {getTrendIcon(category.trend)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 异常支出提醒 */}
      {unusualSpending.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
            异常支出提醒
          </h3>
          <div className="space-y-2">
            {unusualSpending.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div>
                  <div className="font-medium text-gray-900">{item.category}</div>
                  <div className="text-sm text-gray-600">{item.reason}</div>
                </div>
                <div className="font-semibold text-yellow-700">
                  {formatAmount(item.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseAnalysis;