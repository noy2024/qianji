'use client';

import { useState, useEffect } from 'react';
import { Save, X, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface BillFormProps {
  billId?: string | null;
  onCancel: () => void;
  onSuccess: () => void;
}

interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
}

interface Account {
  id: string;
  name: string;
  type: string;
}

interface BillFormData {
  amount: string;
  description: string;
  date: string;
  type: 'INCOME' | 'EXPENSE' | 'INVESTMENT' | 'TRANSFER';
  categoryId: string;
  accountId: string;
}

export default function BillForm({ billId, onCancel, onSuccess }: BillFormProps) {
  const [formData, setFormData] = useState<BillFormData>({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'EXPENSE',
    categoryId: '',
    accountId: ''
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!billId);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!billId;

  // 获取分类和账户数据
  const fetchMetadata = async () => {
    try {
      const [categoriesRes, accountsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/accounts')
      ]);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        const categoryList = Array.isArray(categoriesData) ? categoriesData : categoriesData.data || [];
        setCategories(categoryList);
      }

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json();
        const accountList = Array.isArray(accountsData) ? accountsData : accountsData.data || [];
        setAccounts(accountList);
      }
    } catch (error) {
      console.error('获取元数据失败:', error);
      toast.error('获取分类和账户信息失败');
    }
  };

  // 获取账单详情（编辑模式）
  const fetchBillDetail = async () => {
    if (!billId) return;

    try {
      setInitialLoading(true);
      const response = await fetch(`/api/bills/${billId}`);
      
      if (!response.ok) {
        throw new Error('获取账单详情失败');
      }

      const bill = await response.json();
      setFormData({
        amount: Math.abs(bill.amount).toString(),
        description: bill.description || '',
        date: bill.date ? new Date(bill.date).toISOString().split('T')[0] : '',
        type: bill.type || 'EXPENSE',
        categoryId: bill.categoryId || '',
        accountId: bill.accountId || ''
      });
    } catch (error) {
      console.error('获取账单详情失败:', error);
      toast.error('获取账单详情失败');
    } finally {
      setInitialLoading(false);
    }
  };

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = '请输入有效的金额';
    }

    if (!formData.description.trim()) {
      newErrors.description = '请输入账单描述';
    }

    if (!formData.date) {
      newErrors.date = '请选择日期';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = '请选择分类';
    }

    if (!formData.accountId) {
      newErrors.accountId = '请选择账户';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const submitData = {
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        date: formData.date,
        type: formData.type,
        categoryId: formData.categoryId,
        accountId: formData.accountId
      };

      const url = isEditing ? `/api/bills/${billId}` : '/api/bills';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '保存失败');
      }

      toast.success(isEditing ? '账单更新成功' : '账单创建成功');
      onSuccess();
    } catch (error) {
      console.error('保存账单失败:', error);
      toast.error(error instanceof Error ? error.message : '保存失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理表单字段变化
  const handleFieldChange = (field: keyof BillFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 根据类型筛选分类
  const getFilteredCategories = () => {
    if (formData.type === 'INVESTMENT' || formData.type === 'TRANSFER') {
      return categories; // 投资和转账可以使用所有分类
    }
    return categories.filter(cat => cat.type === formData.type);
  };

  useEffect(() => {
    fetchMetadata();
    if (billId) {
      fetchBillDetail();
    }
  }, [billId]);

  if (initialLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="text-gray-500">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* 表单头部 */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? '编辑账单' : '新建账单'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 表单内容 */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 账单类型 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              账单类型 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { value: 'EXPENSE', label: '支出', color: 'text-red-600 border-red-200 bg-red-50' },
                { value: 'INCOME', label: '收入', color: 'text-green-600 border-green-200 bg-green-50' },
                { value: 'INVESTMENT', label: '投资', color: 'text-blue-600 border-blue-200 bg-blue-50' },
                { value: 'TRANSFER', label: '转账', color: 'text-purple-600 border-purple-200 bg-purple-50' }
              ].map((type) => (
                <label key={type.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value={type.value}
                    checked={formData.type === type.value}
                    onChange={(e) => handleFieldChange('type', e.target.value as any)}
                    className="sr-only"
                  />
                  <div className={`p-3 text-center border-2 rounded-lg transition-all ${
                    formData.type === type.value
                      ? type.color
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="text-sm font-medium">{type.label}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 金额 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              金额 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleFieldChange('amount', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.amount ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          {/* 日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              日期 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleFieldChange('date', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>

          {/* 分类 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              分类 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => handleFieldChange('categoryId', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.categoryId ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">请选择分类</option>
              {getFilteredCategories().map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
            )}
          </div>

          {/* 账户 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              账户 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.accountId}
              onChange={(e) => handleFieldChange('accountId', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.accountId ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">请选择账户</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.type})
                </option>
              ))}
            </select>
            {errors.accountId && (
              <p className="mt-1 text-sm text-red-600">{errors.accountId}</p>
            )}
          </div>

          {/* 描述 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              描述 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="请输入账单描述..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>
        </div>

        {/* 表单按钮 */}
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {loading ? '保存中...' : (isEditing ? '更新' : '创建')}
          </button>
        </div>
      </form>
    </div>
  );
}