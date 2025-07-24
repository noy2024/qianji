'use client';

import React, { useState } from 'react';
import { 
  TrendingDown, 
  TrendingUp, 
  PiggyBank, 
  Target, 
  Clock, 
  Star, 
  CheckCircle, 
  AlertCircle,
  Lightbulb,
  DollarSign
} from 'lucide-react';

interface AIRecommendation {
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

interface AIRecommendationsProps {
  recommendations: AIRecommendation[];
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({ recommendations }) => {
  const [completedRecommendations, setCompletedRecommendations] = useState<Set<string>>(new Set());
  const [favoriteRecommendations, setFavoriteRecommendations] = useState<Set<string>>(new Set());

  // 格式化金额
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // 获取建议类型信息
  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'expense_reduction':
        return {
          icon: <TrendingDown className="w-5 h-5" />,
          label: '支出优化',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'income_increase':
        return {
          icon: <TrendingUp className="w-5 h-5" />,
          label: '收入提升',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'investment':
        return {
          icon: <Target className="w-5 h-5" />,
          label: '投资理财',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'savings':
        return {
          icon: <PiggyBank className="w-5 h-5" />,
          label: '储蓄规划',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        };
      default:
        return {
          icon: <Lightbulb className="w-5 h-5" />,
          label: '其他建议',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  // 获取影响程度信息
  const getImpactInfo = (impact: string) => {
    switch (impact) {
      case 'high':
        return {
          label: '高影响',
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        };
      case 'medium':
        return {
          label: '中影响',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100'
        };
      case 'low':
        return {
          label: '低影响',
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        };
      default:
        return {
          label: '未知',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100'
        };
    }
  };

  // 获取难度信息
  const getDifficultyInfo = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return {
          label: '容易',
          color: 'text-green-600',
          dots: 1
        };
      case 'medium':
        return {
          label: '中等',
          color: 'text-yellow-600',
          dots: 2
        };
      case 'hard':
        return {
          label: '困难',
          color: 'text-red-600',
          dots: 3
        };
      default:
        return {
          label: '未知',
          color: 'text-gray-600',
          dots: 1
        };
    }
  };

  // 切换完成状态
  const toggleCompleted = (id: string) => {
    const newCompleted = new Set(completedRecommendations);
    if (newCompleted.has(id)) {
      newCompleted.delete(id);
    } else {
      newCompleted.add(id);
    }
    setCompletedRecommendations(newCompleted);
  };

  // 切换收藏状态
  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favoriteRecommendations);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavoriteRecommendations(newFavorites);
  };

  // 按优先级排序
  const sortedRecommendations = [...recommendations].sort((a, b) => a.priority - b.priority);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">AI智能建议</h2>
        <div className="text-sm text-gray-600">
          共 {recommendations.length} 条建议
        </div>
      </div>

      {/* 建议统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-sm text-blue-600 font-medium">总建议数</div>
          <div className="text-xl font-bold text-blue-900">{recommendations.length}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-sm text-green-600 font-medium">已完成</div>
          <div className="text-xl font-bold text-green-900">{completedRecommendations.size}</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3">
          <div className="text-sm text-yellow-600 font-medium">已收藏</div>
          <div className="text-xl font-bold text-yellow-900">{favoriteRecommendations.size}</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="text-sm text-purple-600 font-medium">预计节省</div>
          <div className="text-xl font-bold text-purple-900">
            {formatAmount(
              recommendations
                .filter(r => r.estimatedSavings)
                .reduce((sum, r) => sum + (r.estimatedSavings || 0), 0)
            )}
          </div>
        </div>
      </div>

      {/* 建议列表 */}
      <div className="space-y-4">
        {sortedRecommendations.map((recommendation) => {
          const typeInfo = getTypeInfo(recommendation.type);
          const impactInfo = getImpactInfo(recommendation.impact);
          const difficultyInfo = getDifficultyInfo(recommendation.difficulty);
          const isCompleted = completedRecommendations.has(recommendation.id);
          const isFavorite = favoriteRecommendations.has(recommendation.id);

          return (
            <div
              key={recommendation.id}
              className={`border rounded-lg p-4 transition-all duration-200 ${
                isCompleted 
                  ? 'bg-green-50 border-green-200 opacity-75' 
                  : 'bg-white border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* 标题和类型 */}
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${typeInfo.bgColor} ${typeInfo.borderColor} border`}>
                      <span className={typeInfo.color}>{typeInfo.icon}</span>
                      <span className={typeInfo.color}>{typeInfo.label}</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${impactInfo.bgColor}`}>
                      <span className={impactInfo.color}>{impactInfo.label}</span>
                    </div>
                    {recommendation.priority <= 2 && (
                      <div className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
                        高优先级
                      </div>
                    )}
                  </div>

                  {/* 标题 */}
                  <h3 className={`text-lg font-semibold mb-2 ${
                    isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
                  }`}>
                    {recommendation.title}
                  </h3>

                  {/* 描述 */}
                  <p className={`text-sm mb-3 ${
                    isCompleted ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {recommendation.description}
                  </p>

                  {/* 详细信息 */}
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{recommendation.timeframe}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>难度:</span>
                      <div className="flex space-x-1">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${
                              i < difficultyInfo.dots 
                                ? difficultyInfo.color.replace('text-', 'bg-') 
                                : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className={difficultyInfo.color}>({difficultyInfo.label})</span>
                    </div>
                    {recommendation.estimatedSavings && (
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-3 h-3" />
                        <span>预计节省: {formatAmount(recommendation.estimatedSavings)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => toggleFavorite(recommendation.id)}
                    className={`p-2 rounded-full transition-colors ${
                      isFavorite 
                        ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100' 
                        : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                    }`}
                    title={isFavorite ? '取消收藏' : '收藏'}
                  >
                    <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => toggleCompleted(recommendation.id)}
                    className={`p-2 rounded-full transition-colors ${
                      isCompleted 
                        ? 'text-green-500 bg-green-50 hover:bg-green-100' 
                        : 'text-gray-400 hover:text-green-500 hover:bg-green-50'
                    }`}
                    title={isCompleted ? '标记为未完成' : '标记为已完成'}
                  >
                    <CheckCircle className={`w-4 h-4 ${isCompleted ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 空状态 */}
      {recommendations.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无AI建议</h3>
          <p className="text-gray-600">系统正在分析您的财务数据，请稍后再试</p>
        </div>
      )}

      {/* 底部说明 */}
      {recommendations.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-700">
            <strong>AI建议说明：</strong>
            以上建议基于您的财务数据和行为模式生成，仅供参考。
            请根据个人实际情况谨慎采纳，如有疑问建议咨询专业财务顾问。
          </div>
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;