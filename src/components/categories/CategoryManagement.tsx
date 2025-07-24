'use client';

import { useState, useEffect } from 'react';
import { BillType } from '@prisma/client';

interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  type: BillType;
  billCount: number;
  totalAmount: number;
  createdAt: string;
}

interface CategoryFormData {
  name: string;
  description: string;
  color: string;
  icon: string;
  type: BillType;
}

const BILL_TYPES = [
  { value: 'EXPENSE', label: '支出', color: 'text-red-600' },
  { value: 'INCOME', label: '收入', color: 'text-green-600' },
  { value: 'INVESTMENT', label: '投资', color: 'text-blue-600' },
  { value: 'TRANSFER', label: '转账', color: 'text-purple-600' }
];

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#10B981', '#14B8A6',
  '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#D946EF', '#EC4899'
];

const PRESET_ICONS = [
  '🍔', '🛒', '🚗', '🏠', '💊', '🎬', '👕', '⚡',
  '📱', '💰', '🎓', '✈️', '🏋️', '🎵', '📚', '☕'
];

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedType, setSelectedType] = useState<BillType | 'ALL'>('ALL');
  
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    color: PRESET_COLORS[0],
    icon: PRESET_ICONS[0],
    type: 'EXPENSE'
  });

  useEffect(() => {
    fetchCategories();
  }, [selectedType]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const typeParam = selectedType !== 'ALL' ? `&type=${selectedType}` : '';
      const response = await fetch(`/api/categories?userId=default-user${typeParam}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setCategories(result.data || []);
      } else if (Array.isArray(result)) {
        // Handle legacy response format
        setCategories(result);
      } else {
        console.error('Failed to fetch categories:', result.error);
        setCategories([]);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingCategory ? '/api/categories' : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          id: editingCategory?.id,
          userId: 'default-user'
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        fetchCategories();
        resetForm();
      } else {
        console.error('Failed to save category:', result.error);
      }
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || PRESET_COLORS[0],
      icon: category.icon || PRESET_ICONS[0],
      type: category.type
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个分类吗？')) return;

    try {
      const response = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      if (result.success) {
        fetchCategories();
      } else {
        console.error('Failed to delete category:', result.error);
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: PRESET_COLORS[0],
      icon: PRESET_ICONS[0],
      type: 'EXPENSE'
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  const getBillTypeInfo = (type: BillType) => {
    return BILL_TYPES.find(t => t.value === type) || BILL_TYPES[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">分类管理</h1>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            新建分类
          </button>
        </div>

        {/* 类型筛选 */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedType('ALL')}
              className={`px-4 py-2 rounded-lg ${
                selectedType === 'ALL' 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-white text-gray-700 border'
              }`}
            >
              全部
            </button>
            {BILL_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value as BillType)}
                className={`px-4 py-2 rounded-lg ${
                  selectedType === type.value 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-white text-gray-700 border'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* 分类列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const typeInfo = getBillTypeInfo(category.type);
            return (
              <div key={category.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <span className={`text-sm ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      删除
                    </button>
                  </div>
                </div>
                
                {category.description && (
                  <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                )}
                
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{category.billCount || 0} 笔交易</span>
                  <span>¥{(category.totalAmount || 0).toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 创建/编辑表单 */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-semibold mb-4">
                {editingCategory ? '编辑分类' : '新建分类'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    分类名称
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    类型
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as BillType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {BILL_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    描述
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    颜色
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-gray-900' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    图标
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {PRESET_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`w-8 h-8 rounded border text-lg ${
                          formData.icon === icon 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingCategory ? '更新' : '创建'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}