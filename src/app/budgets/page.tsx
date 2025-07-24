'use client';

import React from 'react';
import { Target, Plus, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import PageNavigation from '@/components/navigation/PageNavigation';

const budgetsTabs = [
  { id: 'overview', label: '预算总览', icon: Target },
  { id: 'settings', label: '预算设置', icon: Plus },
  { id: 'alerts', label: '预警提醒', icon: AlertTriangle }
];

const mockBudgets = [
  { 
    id: 1, 
    name: '餐饮预算', 
    category: '餐饮美食', 
    budget: 2000, 
    spent: 1650, 
    status: 'warning',
    period: '本月'
  },
  { 
    id: 2, 
    name: '交通预算', 
    category: '交通出行', 
    budget: 800, 
    spent: 520, 
    status: 'normal',
    period: '本月'
  },
  { 
    id: 3, 
    name: '购物预算', 
    category: '购物消费', 
    budget: 1500, 
    spent: 1800, 
    status: 'exceeded',
    period: '本月'
  }
];

export default function BudgetsPage() {
  const [activeTab, setActiveTab] = React.useState('overview');

  const breadcrumbItems = [
    { label: '首页', href: '/' },
    { label: '预算管理', href: '/budgets' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'exceeded': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <Clock className="w-4 h-4" />;
      case 'exceeded': return <AlertTriangle className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal': return '正常';
      case 'warning': return '预警';
      case 'exceeded': return '超支';
      default: return '未知';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* 预算总览卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">总预算</p>
                    <p className="text-2xl font-bold text-blue-600">¥4,300</p>
                  </div>
                  <Target className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">已支出</p>
                    <p className="text-2xl font-bold text-red-600">¥3,970</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">剩余预算</p>
                    <p className="text-2xl font-bold text-green-600">¥330</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>
            </div>

            {/* 预算列表 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">预算详情</h3>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    <span>新建预算</span>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {mockBudgets.map((budget) => {
                    const percentage = (budget.spent / budget.budget) * 100;
                    return (
                      <div key={budget.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="font-medium text-gray-900">{budget.name}</span>
                            <span className="text-sm text-gray-500">({budget.category})</span>
                          </div>
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(budget.status)}`}>
                            {getStatusIcon(budget.status)}
                            <span>{getStatusText(budget.status)}</span>
                          </div>
                        </div>
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                            <span>已支出 ¥{budget.spent.toLocaleString()}</span>
                            <span>预算 ¥{budget.budget.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                percentage > 100 ? 'bg-red-500' : 
                                percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">{budget.period}</span>
                          <span className={`font-medium ${
                            percentage > 100 ? 'text-red-600' : 
                            percentage > 80 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">预算设置</h3>
            <p className="text-gray-600">预算设置功能正在开发中...</p>
          </div>
        );
      case 'alerts':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">预警提醒</h3>
            <p className="text-gray-600">预警提醒功能正在开发中...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">预算管理</h1>
          <p className="mt-2 text-gray-600">设置预算目标、监控执行情况和预警提醒</p>
        </div>

        <PageNavigation
          tabs={budgetsTabs}
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