'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Trash2, Calendar, DollarSign, Tag, CreditCard, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface BillDetailProps {
  billId: string | null;
  onEdit: () => void;
  onBack: () => void;
}

interface BillDetail {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: 'INCOME' | 'EXPENSE' | 'INVESTMENT' | 'TRANSFER';
  category: {
    id: string;
    name: string;
    type: string;
  };
  account: {
    id: string;
    name: string;
    type: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function BillDetail({ billId, onEdit, onBack }: BillDetailProps) {
  const [bill, setBill] = useState<BillDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // 获取账单详情
  const fetchBillDetail = async () => {
    if (!billId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/bills/${billId}`);
      
      if (!response.ok) {
        throw new Error('获取账单详情失败');
      }

      const data = await response.json();
      setBill(data);
    } catch (error) {
      console.error('获取账单详情失败:', error);
      toast.error('获取账单详情失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除账单
  const handleDelete = async () => {
    if (!bill || !confirm('确定要删除这条账单吗？此操作不可恢复。')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/bills/${bill.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('删除失败');
      }

      toast.success('账单删除成功');
      onBack();
    } catch (error) {
      console.error('删除账单失败:', error);
      toast.error('删除账单失败');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchBillDetail();
  }, [billId]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INCOME':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'EXPENSE':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'INVESTMENT':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'TRANSFER':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'INCOME':
        return '收入';
      case 'EXPENSE':
        return '支出';
      case 'INVESTMENT':
        return '投资';
      case 'TRANSFER':
        return '转账';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="text-gray-500">加载中...</div>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">账单不存在或已被删除</div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部操作栏 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            返回列表
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="w-4 h-4" />
              编辑
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? '删除中...' : '删除'}
            </button>
          </div>
        </div>
      </div>

      {/* 账单详情卡片 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* 账单头部 */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border-2 ${getTypeColor(bill.type)}`}>
                  {getTypeName(bill.type)}
                </span>
              </div>
              <h1 className="text-2xl font-bold mb-1">{bill.description}</h1>
              <p className="text-blue-100">{formatDate(bill.date)}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {bill.type === 'INCOME' ? '+' : '-'}¥{Math.abs(bill.amount).toFixed(2)}
              </div>
              <div className="text-blue-100 text-sm mt-1">
                {bill.type === 'INCOME' ? '收入金额' : '支出金额'}
              </div>
            </div>
          </div>
        </div>

        {/* 详细信息 */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h3>
              
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">交易日期</div>
                  <div className="font-medium">{formatDate(bill.date)}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">交易金额</div>
                  <div className="font-medium text-lg">
                    <span className={bill.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
                      {bill.type === 'INCOME' ? '+' : '-'}¥{Math.abs(bill.amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">交易分类</div>
                  <div className="font-medium">{bill.category?.name || '未分类'}</div>
                  {bill.category?.type && (
                    <div className="text-xs text-gray-400 mt-1">
                      分类类型: {bill.category.type === 'INCOME' ? '收入' : '支出'}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">交易账户</div>
                  <div className="font-medium">{bill.account?.name || '未知账户'}</div>
                  {bill.account?.type && (
                    <div className="text-xs text-gray-400 mt-1">
                      账户类型: {bill.account.type}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 描述和元数据 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">详细描述</h3>
              
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1">交易描述</div>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm">
                    {bill.description || '无描述'}
                  </div>
                </div>
              </div>

              {/* 元数据信息 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">记录信息</h4>
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>账单ID:</span>
                    <span className="font-mono">{bill.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>创建时间:</span>
                    <span>{formatDateTime(bill.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>更新时间:</span>
                    <span>{formatDateTime(bill.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 相关操作 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">相关操作</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50"
          >
            <Edit className="w-4 h-4" />
            编辑此账单
          </button>
          <button
            onClick={() => {
              // 复制账单信息到剪贴板
              const billInfo = `账单信息\n描述: ${bill.description}\n金额: ${bill.type === 'INCOME' ? '+' : '-'}¥${Math.abs(bill.amount).toFixed(2)}\n日期: ${formatDate(bill.date)}\n分类: ${bill.category?.name}\n账户: ${bill.account?.name}`;
              navigator.clipboard.writeText(billInfo);
              toast.success('账单信息已复制到剪贴板');
            }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
          >
            <FileText className="w-4 h-4" />
            复制信息
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? '删除中...' : '删除账单'}
          </button>
        </div>
      </div>
    </div>
  );
}