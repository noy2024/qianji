'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  name: string;
  href: string;
  isLast?: boolean;
}

const pathNameMap: Record<string, string> = {
  '/': '首页',
  '/bills': '账单管理',
  '/bills/create': '新建账单',
  '/bills/edit': '编辑账单',
  '/bills/detail': '账单详情',
  '/ai-analysis': 'AI财务顾问',
  '/investment': '投资回测',
  '/statistics': '统计分析',
  '/categories': '分类管理',
  '/budgets': '预算管理'
};

export default function Breadcrumb() {
  const pathname = usePathname();
  
  // 生成面包屑路径
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    
    // 添加首页
    if (pathname !== '/') {
      breadcrumbs.push({
        name: '首页',
        href: '/'
      });
    }
    
    // 构建路径
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // 获取路径对应的名称
      const name = pathNameMap[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
      
      breadcrumbs.push({
        name,
        href: currentPath,
        isLast
      });
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbs = generateBreadcrumbs();
  
  // 如果只有首页，不显示面包屑
  if (breadcrumbs.length <= 1 && pathname === '/') {
    return null;
  }
  
  return (
    <nav className="bg-gray-50 border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((item, index) => (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
              )}
              
              {item.isLast ? (
                <span className="flex items-center text-gray-900 font-medium">
                  {index === 0 && <Home className="w-4 h-4 mr-1" />}
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {index === 0 && <Home className="w-4 h-4 mr-1" />}
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}