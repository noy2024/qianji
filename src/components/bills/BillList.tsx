'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, DollarSign, Edit, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Bill {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: 'INCOME' | 'EXPENSE' | 'INVESTMENT' | 'TRANSFER';
  category: {
    id: string;
    name: string;
  };
  account: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface BillListProps {
  onCreateNew: () => void;
  onViewDetail: (id: string) => void;
  onEdit: (id: string) => void;
}

interface FilterOptions {
  type?: string;
  categoryId?: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export default function BillList({ onCreateNew, onViewDetail, onEdit }: BillListProps) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [categories, setCategories] = useState<Array<{id: string; name: string}>>([]);
  const [accounts, setAccounts] = useState<Array<{id: string; name: string}>>([]);
  const [showFilters, setShowFilters] = useState(false);

  const pageSize = 20;

  // 获取账单列表
  const fetchBills = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value && value.trim() !== '')
        )
      });

      const response = await fetch(`/api/bills?${params}`);
      if (!response.ok) {
        throw new Error('获取账单列表失败');
      }

      const data = await response.json();
      setBills(data.bills || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
    } catch (error) {
      console.error('获取账单列表失败:', error);
      toast.error('获取账单列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取分类和账户列表
  const fetchMetadata = async () => {
    try {
      const [categoriesRes, accountsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/accounts')
      ]);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(Array.isArray(categoriesData) ? categoriesData : categoriesData.data || []);
      }

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json();
        setAccounts(Array.isArray(accountsData) ? accountsData : accountsData.data || []);
      }
    } catch (error) {
      console.error('获取元数据失败:', error);
    }
  };

  // 删除账单
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条账单吗？')) {
      return;
    }

    try {
      const response = await fetch(`/api/bills/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('删除失败');
      }

      toast.success('账单删除成功');
      fetchBills();
    } catch (error) {
      console.error('删除账单失败:', error);
      toast.error('删除账单失败');
    }
  };

  // 应用筛选
  const applyFilters = () => {
    setCurrentPage(1);
    fetchBills();
  };

  // 重置筛选
  const resetFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchBills();
  }, [currentPage]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INCOME':
        return 'text-green-600 bg-green-50';
      case 'EXPENSE':
        return 'text-red-600 bg-red-50';
      case 'INVESTMENT':
        return 'text-blue-600 bg-blue-50';
      case 'TRANSFER':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
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

  return (
    <div className="space-y-6">
      {/* 搜索和筛选栏 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索账单描述..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 筛选按钮 */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            筛选
          </button>

          {/* 搜索按钮 */}
          <button
            onClick={applyFilters}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            搜索
          </button>
        </div>

        {/* 高级筛选 */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 类型筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部类型</option>
                  <option value="INCOME">收入</option>
                  <option value="EXPENSE">支出</option>
                  <option value="INVESTMENT">投资</option>
                  <option value="TRANSFER">转账</option>
                </select>
              </div>

              {/* 分类筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <select
                  value={filters.categoryId || ''}
                  onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部分类</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 开始日期 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
                <input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 结束日期 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
                <input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                应用筛选
              </button>
              <button
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                重置
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 统计信息 */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            共找到 {totalCount} 条账单
          </span>
          <span className="text-sm text-gray-600">
            第 {currentPage} 页，共 {totalPages} 页
          </span>
        </div>
      </div>

      {/* 账单列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : bills.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-500 mb-4">暂无账单数据</div>
            <button
              onClick={onCreateNew}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              创建第一条账单
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日期
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    描述
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    类型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    分类
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    金额
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    账户
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(bill.date).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={bill.description}>
                        {bill.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(bill.type)}`}>
                        {getTypeName(bill.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bill.category?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={bill.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
                        {bill.type === 'INCOME' ? '+' : '-'}¥{Math.abs(bill.amount).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bill.account?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onViewDetail(bill.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(bill.id)}
                          className="text-green-600 hover:text-green-900"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(bill.id)}
                          className="text-red-600 hover:text-red-900"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-center">
            <nav className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                上一页
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm border rounded-lg ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                下一页
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}