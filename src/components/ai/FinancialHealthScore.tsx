'use client';

import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

interface FinancialHealthScoreProps {
  score: number;
  level: 'excellent' | 'good' | 'fair' | 'poor';
  factors: {
    incomeStability: number;
    expenseControl: number;
    savingsRate: number;
    debtRatio: number;
  };
  suggestions: string[];
}

const FinancialHealthScore: React.FC<FinancialHealthScoreProps> = ({
  score,
  level,
  factors,
  suggestions
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-blue-100';
    if (score >= 40) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'excellent': return '优秀';
      case 'good': return '良好';
      case 'fair': return '一般';
      case 'poor': return '需改善';
      default: return '未知';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'excellent':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'good':
        return <TrendingUp className="w-6 h-6 text-blue-600" />;
      case 'fair':
        return <TrendingDown className="w-6 h-6 text-yellow-600" />;
      case 'poor':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  const getFactorLabel = (key: string) => {
    switch (key) {
      case 'incomeStability': return '收入稳定性';
      case 'expenseControl': return '支出控制';
      case 'savingsRate': return '储蓄率';
      case 'debtRatio': return '负债率';
      default: return key;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">财务健康度评分</h2>
        {getLevelIcon(level)}
      </div>

      {/* 主要评分显示 */}
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBackground(score)} mb-4`}>
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
              {score}
            </div>
            <div className="text-sm text-gray-600">分</div>
          </div>
        </div>
        <div className="text-lg font-semibold text-gray-800">
          {getLevelText(level)}
        </div>
      </div>

      {/* 详细因子分析 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">详细分析</h3>
        <div className="space-y-4">
          {Object.entries(factors).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {getFactorLabel(key)}
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      value >= 80 ? 'bg-green-500' :
                      value >= 60 ? 'bg-blue-500' :
                      value >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(value, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-600 w-12 text-right">
                  {value.toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 改善建议 */}
      {suggestions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">改善建议</h3>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialHealthScore;