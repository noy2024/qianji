'use client';

import React from 'react';
import { FolderOpen, Plus, Edit, Trash2, Settings } from 'lucide-react';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import PageNavigation from '@/components/navigation/PageNavigation';

const categoriesTabs = [
  { id: 'list', label: '分类列表', icon: FolderOpen },
  { id: 'settings', label: '分类设置', icon: Settings },
  { id: 'rules', label: '规则配置', icon: Edit }
];

const mockCategories = [
  { id: 1, name: '餐饮美食', type: 'expense', count: 45, color: '#ef4444' },
  { id: 2, name: '交通出行', type: 'expense', count: 23, color: '#3b82f6' },
  { id: 3, name: '购物消费', type: 'expense', count: 67, color: '#8b5cf6' },
  { id: 4, name: '工资收入', type: 'income', count: 12, color: '#10b981' },
  { id: 5, name: '投资收益', type: 'income', count: 8, color: '#f59e0b' }
];

export default function CategoriesPage() {
  const [activeTab, setActiveTab] = React.useState('list');

  const breadcrumbItems = [
    { label: '首页', href: '/' },
    { label: '分类管理', href: '/categories' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'list':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">分类列表</h3>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>新建分类</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockCategories.map((category) => (
                  <div key={category.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium text-gray-900">{category.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        category.type === 'income' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.type === 'income' ? '收入' : '支出'}
                      </span>
                      <span className="text-gray-500">{category.count} 笔账单</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">分类设置</h3>
            <p className="text-gray-600">分类设置功能正在开发中...</p>
          </div>
        );
      case 'rules':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">规则配置</h3>
            <p className="text-gray-600">规则配置功能正在开发中...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">分类管理</h1>
          <p className="mt-2 text-gray-600">管理收支分类、设置规则和批量操作</p>
        </div>

        <PageNavigation
          tabs={categoriesTabs}
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