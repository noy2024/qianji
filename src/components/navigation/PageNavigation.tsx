'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface TabItem {
  id: string;
  name: string;
  icon?: LucideIcon;
  count?: number;
}

interface ActionButton {
  id: string;
  name: string;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick: () => void;
}

interface PageNavigationProps {
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  actions?: ActionButton[];
  title?: string;
  description?: string;
}

export default function PageNavigation({
  tabs = [],
  activeTab,
  onTabChange,
  actions = [],
  title,
  description
}: PageNavigationProps) {
  const getButtonVariantClasses = (variant: ActionButton['variant'] = 'secondary') => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600';
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700 border-red-600';
      default:
        return 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300';
    }
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题和描述 */}
        {(title || description) && (
          <div className="py-4 border-b border-gray-100">
            {title && (
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            )}
            {description && (
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between py-4">
          {/* 标签页导航 */}
          {tabs.length > 0 && (
            <div className="flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange?.(tab.id)}
                    className={`
                      flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                      ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    {Icon && (
                      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                    )}
                    <span>{tab.name}</span>
                    {tab.count !== undefined && (
                      <span className={`
                        px-2 py-0.5 text-xs rounded-full
                        ${
                          isActive
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }
                      `}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* 操作按钮 */}
          {actions.length > 0 && (
            <div className="flex items-center space-x-3">
              {actions.map((action) => {
                const Icon = action.icon;
                
                return (
                  <button
                    key={action.id}
                    onClick={action.onClick}
                    className={`
                      flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200
                      ${getButtonVariantClasses(action.variant)}
                    `}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span>{action.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}