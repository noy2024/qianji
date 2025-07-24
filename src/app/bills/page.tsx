'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import { PageNavigation } from '@/components/navigation';
import BillList from '@/components/bills/BillList';
import BillForm from '@/components/bills/BillForm';
import BillDetail from '@/components/bills/BillDetail';

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

function BillsPageContent() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const mode = searchParams.get('mode') as ViewMode;
    const billId = searchParams.get('id');
    
    if (mode && ['list', 'create', 'edit', 'detail'].includes(mode)) {
      setViewMode(mode);
    }
    
    if (billId) {
      setSelectedBillId(billId);
    }
  }, [searchParams]);

  const handleViewChange = (mode: ViewMode, billId?: string) => {
    setViewMode(mode);
    setSelectedBillId(billId || null);
    
    // 更新URL
    const url = new URL(window.location.href);
    url.searchParams.set('mode', mode);
    if (billId) {
      url.searchParams.set('id', billId);
    } else {
      url.searchParams.delete('id');
    }
    window.history.pushState({}, '', url.toString());
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'create':
        return (
          <BillForm
            onCancel={() => handleViewChange('list')}
            onSuccess={() => handleViewChange('list')}
          />
        );
      case 'edit':
        return (
          <BillForm
            billId={selectedBillId}
            onCancel={() => handleViewChange('list')}
            onSuccess={() => handleViewChange('list')}
          />
        );
      case 'detail':
        return (
          <BillDetail
            billId={selectedBillId}
            onEdit={() => handleViewChange('edit', selectedBillId || undefined)}
            onBack={() => handleViewChange('list')}
          />
        );
      default:
        return (
          <BillList
            onCreateNew={() => handleViewChange('create')}
            onViewDetail={(id) => handleViewChange('detail', id)}
            onEdit={(id) => handleViewChange('edit', id)}
          />
        );
    }
  };

  const getPageTitle = () => {
    switch (viewMode) {
      case 'create':
        return '新建账单';
      case 'edit':
        return '编辑账单';
      case 'detail':
        return '账单详情';
      default:
        return '账单管理';
    }
  };

  const getPageDescription = () => {
    switch (viewMode) {
      case 'create':
        return '创建新的收支记录';
      case 'edit':
        return '修改账单信息';
      case 'detail':
        return '查看账单详细信息';
      default:
        return '管理您的收支记录，查看账单详情';
    }
  };

  const getActions = () => {
    const actions = [];
    
    if (viewMode !== 'list') {
      actions.push({
        id: 'back',
        name: '返回列表',
        icon: ArrowLeft,
        variant: 'secondary' as const,
        onClick: () => handleViewChange('list')
      });
    }
    
    if (viewMode === 'list') {
      actions.push({
        id: 'create',
        name: '新建账单',
        icon: Plus,
        variant: 'primary' as const,
        onClick: () => handleViewChange('create')
      });
    }
    
    return actions;
  };

  return (
    <div className="bg-white">
      <PageNavigation
        title={getPageTitle()}
        description={getPageDescription()}
        actions={getActions()}
      />
      
      <div className="bg-gray-50 min-h-screen">
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default function BillsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">加载中...</div>
      </div>
    }>
      <BillsPageContent />
    </Suspense>
  );
}