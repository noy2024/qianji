'use client';

import React from 'react';
import { BarChart3, TrendingUp, PieChart, Calendar } from 'lucide-react';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import PageNavigation from '@/components/navigation/PageNavigation';

const statisticsTabs = [
  { id: 'overview', label: '总览', icon: BarChart3 },
  { id: 'income', label: '收入分析', icon: TrendingUp },
  { id: 'expense', label: '支出分析', icon: PieChart },
  { id: 'trend', label: '趋势分析', icon: Calendar }
];

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = React.useState('overview');

  const breadcrumbItems = [
    { label: '首页', href: '/' },
    { label: '统计分析', href: '/statistics' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">本月收入</p>
                  <p className="text-2xl font-bold text-green-600">¥12,580</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">本月支出</p>
                  <p className="text-2xl font-bold text-red-600">¥8,420</p>
                </div>
                <PieChart className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">净收入</p>
                  <p className="text-2xl font-bold text-blue-600">¥4,160</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">账单数量</p>
                  <p className="text-2xl font-bold text-gray-900">156</p>
                </div>
                <Calendar className="w-8 h-8 text-gray-500" />
              </div>
            </div>
          </div>
        );
      case 'income':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">收入分析</h3>
            <p className="text-gray-600">收入分析功能正在开发中...</p>
          </div>
        );
      case 'expense':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">支出分析</h3>
            <p className="text-gray-600">支出分析功能正在开发中...</p>
          </div>
        );
      case 'trend':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">趋势分析</h3>
            <p className="text-gray-600">趋势分析功能正在开发中...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">统计分析</h1>
          <p className="mt-2 text-gray-600">查看收支统计、分类分析和趋势图表</p>
        </div>

        <PageNavigation
          tabs={statisticsTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="mt-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}