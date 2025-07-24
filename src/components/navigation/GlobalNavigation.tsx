'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Receipt, 
  Brain, 
  TrendingUp, 
  BarChart3, 
  FolderOpen, 
  Target,
  Menu,
  X,
  RefreshCw,
  Settings,
  HelpCircle
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const navigationItems: NavigationItem[] = [
  {
    name: '首页',
    href: '/',
    icon: Home,
    description: '导入账单、统计分析、分类管理、预算管理'
  },
  {
    name: '账单管理',
    href: '/bills',
    icon: Receipt,
    description: '账单列表、新建账单、编辑账单'
  },
  {
    name: 'AI财务顾问',
    href: '/ai-analysis',
    icon: Brain,
    description: '财务分析、智能建议、规划助手'
  },
  {
    name: '投资回测',
    href: '/investment',
    icon: TrendingUp,
    description: '投资计算、历史回测、收益分析'
  },
  {
    name: '统计分析',
    href: '/statistics',
    icon: BarChart3,
    description: '收支统计、分类分析、趋势图表'
  },
  {
    name: '分类管理',
    href: '/categories',
    icon: FolderOpen,
    description: '分类设置、规则配置、批量操作'
  },
  {
    name: '预算管理',
    href: '/budgets',
    icon: Target,
    description: '预算设置、执行监控、预警提醒'
  }
];

export default function GlobalNavigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <>
      {/* 桌面端导航栏 */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 品牌区域 */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">钱</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">钱迹</span>
              </Link>
            </div>

            {/* 桌面端主导航菜单 */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${
                        active
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                    title={item.description}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* 用户操作区域 */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="刷新页面"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              
              <button
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="设置"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              <button
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="帮助"
              >
                <HelpCircle className="w-5 h-5" />
              </button>

              {/* 移动端菜单按钮 */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="菜单"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 移动端侧边栏 */}
      {isMobileMenuOpen && (
        <>
          {/* 遮罩层 */}
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* 侧边栏 */}
          <div className="lg:hidden fixed top-0 right-0 w-80 h-full bg-white shadow-xl z-50 transform transition-transform duration-300">
            <div className="flex flex-col h-full">
              {/* 侧边栏头部 */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">钱</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">钱迹</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 导航菜单 */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`
                          flex items-center space-x-3 p-3 rounded-lg transition-all duration-200
                          ${
                            active
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }
                        `}
                      >
                        <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* 侧边栏底部操作 */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center justify-around">
                  <button
                    onClick={handleRefresh}
                    className="flex flex-col items-center space-y-1 p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span className="text-xs">刷新</span>
                  </button>
                  
                  <button className="flex flex-col items-center space-y-1 p-2 text-gray-500 hover:text-gray-700 transition-colors">
                    <Settings className="w-5 h-5" />
                    <span className="text-xs">设置</span>
                  </button>
                  
                  <button className="flex flex-col items-center space-y-1 p-2 text-gray-500 hover:text-gray-700 transition-colors">
                    <HelpCircle className="w-5 h-5" />
                    <span className="text-xs">帮助</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}