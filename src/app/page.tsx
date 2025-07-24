"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Upload, BarChart3, FolderOpen, Target } from 'lucide-react';
import { PageNavigation } from '@/components/navigation';
import StatisticsOverview from '@/components/statistics/StatisticsOverview';
import CategoryManagement from '@/components/categories/CategoryManagement';
import BudgetManagement from '@/components/budgets/BudgetManagement';

type PageView = 'upload' | 'statistics' | 'categories' | 'budgets' | 'bills';

function HomePageContent() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<PageView>('upload');
  const searchParams = useSearchParams();

  useEffect(() => {
    const view = searchParams.get('view') as PageView;
    if (view && ['upload', 'statistics', 'categories', 'budgets', 'bills'].includes(view)) {
      setCurrentView(view);
    }
  }, [searchParams]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    setIsLoading(true);
    setMessage("Uploading...");

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`${data.message} - 导入 ${data.summary.total} 条记录，总金额 ¥${data.summary.totalAmount.toFixed(2)}`);
        setFile(null);
        // 重置文件输入
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage("An unexpected error occurred.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderUploadView = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-md mx-auto p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800">导入账单</h1>
        
        <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">支持的格式：</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>微信支付账单 (.csv)</li>
            <li>支付宝账单 (.csv)</li>
            <li>通用CSV格式</li>
            <li>银行流水文件</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">账单文件</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                    <span>选择文件</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".csv,.xlsx,.xls" />
                  </label>
                  <p className="pl-1">或拖拽文件到此处</p>
                </div>
                <p className="text-xs text-gray-500">CSV, Excel 文件</p>
              </div>
            </div>
            {file && <p className='text-sm text-gray-500 mt-2'>已选择: {file.name}</p>}
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading || !file}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? '处理中...' : '上传并导入'}
            </button>
          </div>
        </form>
        {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'statistics':
        return <StatisticsOverview />;
      case 'categories':
        return <CategoryManagement />;
      case 'budgets':
        return <BudgetManagement />;
      default:
        return renderUploadView();
    }
  };

  const tabs = [
    { id: 'upload', name: '导入账单', icon: Upload },
    { id: 'statistics', name: '统计分析', icon: BarChart3 },
    { id: 'categories', name: '分类管理', icon: FolderOpen },
    { id: 'budgets', name: '预算管理', icon: Target }
  ];

  return (
    <div className="bg-white">
      <PageNavigation
        title="钱迹 - 智能财务管理"
        description="个人财务管理和账单分析工具"
        tabs={tabs}
        activeTab={currentView}
        onTabChange={(tabId) => setCurrentView(tabId as PageView)}
      />
      
      <div className="bg-gray-50 min-h-screen">
        {renderContent()}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-lg">加载中...</div></div>}>
      <HomePageContent />
    </Suspense>
  );
}