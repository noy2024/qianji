'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Target, Lightbulb } from 'lucide-react';

interface IncomeForecastProps {
  currentMonthly: number;
  predictedNext3Months: number[];
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  factors: string[];
  recommendations: string[];
}

const IncomeForecast: React.FC<IncomeForecastProps> = ({
  currentMonthly,
  predictedNext3Months,
  trend,
  confidence,
  factors,
  recommendations
}) => {
  // 格式化金额
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // 获取趋势信息
  const getTrendInfo = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return {
          icon: <TrendingUp className="w-5 h-5 text-green-500" />,
          text: '上升趋势',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'decreasing':
        return {
          icon: <TrendingDown className="w-5 h-5 text-red-500" />,
          text: '下降趋势',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'stable':
      default:
        return {
          icon: <Minus className="w-5 h-5 text-blue-500" />,
          text: '稳定趋势',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
    }
  };

  const trendInfo = getTrendInfo(trend);

  // 准备图表数据
  const chartData = [
    { month: '当前月', income: currentMonthly, type: 'actual' },
    { month: '下月', income: predictedNext3Months[0] || 0, type: 'predicted' },
    { month: '下2月', income: predictedNext3Months[1] || 0, type: 'predicted' },
    { month: '下3月', income: predictedNext3Months[2] || 0, type: 'predicted' }
  ];

  // 计算预测变化
  const avgPredicted = predictedNext3Months.reduce((sum, val) => sum + val, 0) / predictedNext3Months.length;
  const changeAmount = avgPredicted - currentMonthly;
  const changePercentage = currentMonthly > 0 ? (changeAmount / currentMonthly) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">收入趋势预测</h2>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${trendInfo.bgColor} ${trendInfo.borderColor} border`}>
          {trendInfo.icon}
          <span className={`text-sm font-medium ${trendInfo.color}`}>{trendInfo.text}</span>
        </div>
      </div>

      {/* 关键指标 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">当前月收入</div>
          <div className="text-2xl font-bold text-blue-900">{formatAmount(currentMonthly)}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium">预测平均</div>
          <div className="text-2xl font-bold text-green-900">{formatAmount(avgPredicted)}</div>
        </div>
        <div className={`rounded-lg p-4 ${
          changeAmount >= 0 ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <div className={`text-sm font-medium ${
            changeAmount >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>预期变化</div>
          <div className={`text-2xl font-bold ${
            changeAmount >= 0 ? 'text-green-900' : 'text-red-900'
          }`}>
            {changeAmount >= 0 ? '+' : ''}{formatAmount(changeAmount)}
          </div>
          <div className={`text-xs ${
            changeAmount >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {changePercentage >= 0 ? '+' : ''}{changePercentage.toFixed(1)}%
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-sm text-purple-600 font-medium">预测置信度</div>
          <div className="text-2xl font-bold text-purple-900">{(confidence * 100).toFixed(0)}%</div>
          <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${confidence * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 趋势图表 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">收入趋势图</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                fontSize={12}
              />
              <YAxis 
                fontSize={12}
                tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  formatAmount(value), 
                  name === 'income' ? '收入' : '收入'
                ]}
                labelFormatter={(label) => `时间: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#2563EB"
                strokeWidth={2}
                fill="url(#incomeGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-blue-600"></div>
            <span className="text-sm text-gray-600">实际收入</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-blue-600" style={{ borderTop: '2px dashed #2563EB' }}></div>
            <span className="text-sm text-gray-600">预测收入</span>
          </div>
        </div>
      </div>

      {/* 影响因素 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Target className="w-5 h-5 text-blue-500 mr-2" />
            影响因素
          </h3>
          <div className="space-y-2">
            {factors.map((factor, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm text-gray-700">{factor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 改善建议 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
            改善建议
          </h3>
          <div className="space-y-2">
            {recommendations.length > 0 ? (
              recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">{recommendation}</span>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">当前收入趋势良好，继续保持！</div>
            )}
          </div>
        </div>
      </div>

      {/* 预测说明 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <strong>预测说明：</strong>
          本预测基于您的历史收入数据和趋势分析生成，实际收入可能受到多种因素影响。
          建议将此预测作为财务规划的参考，并根据实际情况调整预期。
        </div>
      </div>
    </div>
  );
};

export default IncomeForecast;