'use client';

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  RefreshCw, 
  TrendingUp, 
  PieChart, 
  Target, 
  Lightbulb,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { PageNavigation } from '@/components/navigation';
import FinancialHealthScore from '@/components/ai/FinancialHealthScore';
import ExpenseAnalysis from '@/components/ai/ExpenseAnalysis';
import IncomeForecast from '@/components/ai/IncomeForecast';
import AIRecommendations from '@/components/ai/AIRecommendations';

interface AIAnalysisData {
  healthScore: {
    score: number;
    level: 'excellent' | 'good' | 'fair' | 'poor';
    factors: {
      incomeStability: number;
      expenseControl: number;
      savingsRate: number;
      debtRatio: number;
    };
    suggestions: string[];
  };
  expenseAnalysis: {
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
  };
  incomeForecast: {
    currentMonthly: number;
    predictedNext3Months: number[];
    trend: 'increasing' | 'decreasing' | 'stable';
    confidence: number;
    factors: string[];
    recommendations: string[];
  };
  recommendations: {
    id: string;
    type: 'expense_reduction' | 'income_increase' | 'investment' | 'savings';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedSavings?: number;
    timeframe: string;
    priority: number;
  }[];
}

export default function AIAnalysisPage() {
  const [data, setData] = useState<AIAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'expense' | 'income' | 'recommendations'>('overview');

  // 获取AI分析数据
  const fetchAnalysisData = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetch('/api/ai-analysis?type=all');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'AI分析失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      console.error('获取AI分析数据失败:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 页面加载时获取数据
  useEffect(() => {
    fetchAnalysisData();
  }, []);

  // 刷新数据
  const handleRefresh = () => {
    fetchAnalysisData(true);
  };

  // 标签页配置
  const tabs = [
    { id: 'overview', name: '总览', icon: Brain },
    { id: 'health', name: '财务健康度', icon: TrendingUp },
    { id: 'expense', name: '支出分析', icon: PieChart },
    { id: 'income', name: '收入预测', icon: Target },
    { id: 'recommendations', name: 'AI建议', icon: Lightbulb }
  ];

  // 操作按钮配置
  const actions = [
    {
      id: 'refresh',
      name: refreshing ? '刷新中...' : '刷新数据',
      icon: RefreshCw,
      variant: 'secondary' as const,
      onClick: handleRefresh
    }
  ];

  if (loading) {
    return (
      <div className="bg-white">
        <PageNavigation
          title="AI财务顾问"
          description="基于您的财务数据，AI为您提供个性化的分析和建议"
        />
        
        <div className="bg-gray-50 min-h-screen">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">AI正在分析您的财务数据</h3>
              <p className="text-gray-600">请稍候，这可能需要几秒钟...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white">
        <PageNavigation
          title="AI财务顾问"
          description="基于您的财务数据，AI为您提供个性化的分析和建议"
        />
        
        <div className="bg-gray-50 min-h-screen">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">分析失败</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => fetchAnalysisData()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                重试
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <PageNavigation
        title="AI财务顾问"
        description="基于您的财务数据，AI为您提供个性化的分析和建议"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as any)}
        actions={actions}
      />
      
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="space-y-6">
          {activeTab === 'overview' && data && (
            <>
              {/* 概览卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">财务健康度</p>
                      <p className="text-2xl font-bold text-gray-900">{data.healthScore.score}分</p>
                    </div>
                    <div className={`p-3 rounded-full ${
                      data.healthScore.score >= 80 ? 'bg-green-100' :
                      data.healthScore.score >= 60 ? 'bg-blue-100' :
                      data.healthScore.score >= 40 ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      <TrendingUp className={`w-6 h-6 ${
                        data.healthScore.score >= 80 ? 'text-green-600' :
                        data.healthScore.score >= 60 ? 'text-blue-600' :
                        data.healthScore.score >= 40 ? 'text-yellow-600' : 'text-red-600'
                      }`} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">本月支出</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ¥{(data.expenseAnalysis.totalExpense / 10000).toFixed(1)}万
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-red-100">
                      <PieChart className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">当前收入</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ¥{(data.incomeForecast.currentMonthly / 10000).toFixed(1)}万
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-green-100">
                      <Target className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">AI建议</p>
                      <p className="text-2xl font-bold text-gray-900">{data.recommendations.length}条</p>
                    </div>
                    <div className="p-3 rounded-full bg-purple-100">
                      <Lightbulb className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 快速概览 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FinancialHealthScore {...data.healthScore} />
                <AIRecommendations recommendations={data.recommendations.slice(0, 3)} />
              </div>
            </>
          )}

          {activeTab === 'health' && data && (
            <FinancialHealthScore {...data.healthScore} />
          )}

          {activeTab === 'expense' && data && (
            <ExpenseAnalysis {...data.expenseAnalysis} />
          )}

          {activeTab === 'income' && data && (
            <IncomeForecast {...data.incomeForecast} />
          )}

          {activeTab === 'recommendations' && data && (
            <AIRecommendations recommendations={data.recommendations} />
          )}
          </div>
        </div>
      </div>
    </div>
  );
}