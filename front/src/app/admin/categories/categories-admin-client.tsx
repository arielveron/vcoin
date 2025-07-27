'use client';

import { useState } from 'react';
import { InvestmentCategory, CreateInvestmentCategoryRequest } from '@/types/database';
import { createCategory, updateCategory, deleteCategory } from './actions';
import StylePreview from '@/components/admin/style-preview';
import IconPicker from '@/components/admin/icon-picker';
import IconPreview from '@/components/admin/icon-preview';
import IconRenderer from '@/components/icon-renderer';
import ResponsiveTable from '@/components/admin/responsive-table';
import { ICON_ANIMATIONS } from '@/lib/icon-animations';
import { Edit, Trash2, Plus, X, Tag, Eye, Settings, ToggleLeft, ToggleRight } from 'lucide-react';

const PREMIUM_EFFECTS = [
  { value: '', label: 'None' },
  { value: 'effect-gradient-gold', label: 'Gold Gradient' },
  { value: 'effect-gradient-silver', label: 'Silver Gradient' },
  { value: 'effect-gradient-rainbow', label: 'Rainbow Gradient' },
  { value: 'effect-gradient-fire', label: 'Fire Gradient' },
  { value: 'effect-gradient-ice', label: 'Ice Gradient' },
  { value: 'effect-glow-gold', label: 'Gold Glow' },
  { value: 'effect-glow-silver', label: 'Silver Glow' },
  { value: 'effect-glow-neon-blue', label: 'Neon Blue Glow' },
  { value: 'effect-glow-neon-pink', label: 'Neon Pink Glow' },
  { value: 'effect-glow-toxic', label: 'Toxic Glow' },
  { value: 'effect-outline-fire', label: 'Fire Outline' },
  { value: 'effect-outline-electric', label: 'Electric Outline' },
  { value: 'effect-outline-shadow', label: 'Shadow Outline' },
  { value: 'effect-shake', label: 'Shake' },
  { value: 'effect-sparkle', label: 'Sparkle' },
  { value: 'effect-holographic', label: 'Holographic' },
  { value: 'effect-glitch', label: 'Glitch' },
  { value: 'effect-premium-gold', label: 'Premium Gold (Combined)' },
  { value: 'effect-premium-platinum', label: 'Premium Platinum (Combined)' },
  { value: 'effect-premium-legendary', label: 'Legendary (All Effects)' }
];

interface CategoriesAdminClientProps {
  categories: InvestmentCategory[];
}

export default function CategoriesAdminClient({ categories: initialCategories }: CategoriesAdminClientProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<InvestmentCategory | null>(null);
  const [formData, setFormData] = useState<CreateInvestmentCategoryRequest>({
    name: '',
    level: 'bronze',
    text_style: {
      fontSize: 'text-sm',
      fontWeight: 'font-normal',
      textColor: 'text-gray-900'
    },
    icon_config: null,
    is_active: true,
    sort_order: 0
  });
  const [liveFormData, setLiveFormData] = useState<CreateInvestmentCategoryRequest>(formData);

  // Add separate state for icon preview
  const [iconPreviewConfig, setIconPreviewConfig] = useState<{
    name?: string;
    library?: string;
    size?: number;
    color?: string;
    backgroundColor?: string;
    padding?: number;
    animationClass?: string;
  }>({});

  const handleEdit = (category: InvestmentCategory) => {
    setEditingCategory(category);
    const editData = {
      name: category.name,
      level: category.level,
      text_style: category.text_style,
      icon_config: category.icon_config,
      is_active: category.is_active,
      sort_order: category.sort_order
    };
    setFormData(editData);
    setLiveFormData(editData);
    
    // Set icon preview
    if (category.icon_config) {
      setIconPreviewConfig({
        name: category.icon_config.name,
        library: category.icon_config.library,
        size: category.icon_config.size || 24,
        color: category.icon_config.color,
        backgroundColor: category.icon_config.backgroundColor,
        padding: category.icon_config.padding || 4,
        animationClass: category.icon_config.animationClass
      });
    } else {
      setIconPreviewConfig({});
    }
    
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formDataObj = new FormData(e.currentTarget);
    
    try {
      if (editingCategory) {
        const result = await updateCategory(editingCategory.id, formDataObj);
        if (result.success && result.data) {
          setCategories(categories.map(cat => 
            cat.id === editingCategory.id ? result.data! : cat
          ));
          resetForm();
        } else if (!result.success) {
          alert(result.error || 'An error occurred');
        } else {
          alert('Update failed: No data returned');
        }
      } else {
        const result = await createCategory(formDataObj);
        if (result.success && result.data) {
          setCategories([...categories, result.data]);
          resetForm();
        } else if (!result.success) {
          alert(result.error || 'An error occurred');
        } else {
          alert('Create failed: No data returned');
        }
      }
    } catch {
      alert('An error occurred');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const result = await deleteCategory(id);
      if (result.success) {
        setCategories(categories.filter(cat => cat.id !== id));
      } else {
        alert(result.error || 'Failed to delete category');
      }
    } catch {
      alert('Failed to delete category');
    }
  };

  const resetForm = () => {
    const defaultData = {
      name: '',
      level: 'bronze' as const,
      text_style: {
        fontSize: 'text-sm',
        fontWeight: 'font-normal',
        textColor: 'text-gray-900'
      },
      icon_config: null,
      is_active: true,
      sort_order: 0
    };
    setFormData(defaultData);
    setLiveFormData(defaultData);
    setIconPreviewConfig({});
    setEditingCategory(null);
    setShowForm(false);
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'bronze': return 'bg-orange-100 text-orange-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'platinum': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Define columns for ResponsiveTable
  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (category: InvestmentCategory) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Tag className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{category.name}</div>
            <div className="text-sm text-gray-500">Order: {category.sort_order}</div>
          </div>
        </div>
      )
    },
    {
      key: 'level',
      header: 'Level',
      render: (category: InvestmentCategory) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelBadgeColor(category.level)}`}>
          {category.level}
        </span>
      )
    },
    {
      key: 'icon',
      header: 'Icon',
      hideOnMobile: true,
      render: (category: InvestmentCategory) => (
        <div className="flex items-center gap-2">
          {category.icon_config ? (
            <IconRenderer
              name={category.icon_config.name}
              library={category.icon_config.library}
              size={category.icon_config.size || 20}
              color={category.icon_config.color}
              backgroundColor={category.icon_config.backgroundColor}
              padding={category.icon_config.padding}
              animationClass={category.icon_config.animationClass}
            />
          ) : (
            <span className="text-xs text-gray-400">No icon</span>
          )}
        </div>
      )
    },
    {
      key: 'preview',
      header: 'Style',
      hideOnMobile: true,
      render: (category: InvestmentCategory) => (
        <StylePreview 
          category={category} 
          text="Sample" 
          showEffectName={false}
        />
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (category: InvestmentCategory) => (
        <div className="flex items-center space-x-2">
          {category.is_active ? (
            <ToggleRight className="h-5 w-5 text-green-500" />
          ) : (
            <ToggleLeft className="h-5 w-5 text-gray-400" />
          )}
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {category.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (category: InvestmentCategory) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(category)}
            className="text-indigo-600 hover:text-indigo-900 p-1"
            aria-label="Edit category"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(category.id)}
            className="text-red-600 hover:text-red-900 p-1"
            aria-label="Delete category"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  // Custom mobile card
  const mobileCard = (category: InvestmentCategory) => (
    <div>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Tag className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelBadgeColor(category.level)}`}>
              {category.level}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(category)}
            className="text-indigo-600 p-1"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDelete(category.id)}
            className="text-red-600 p-1"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="space-y-3 mb-3">
        <div className="flex items-center space-x-2">
          <Settings className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">Sort Order: {category.sort_order}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {category.is_active ? (
            <ToggleRight className="h-5 w-5 text-green-500" />
          ) : (
            <ToggleLeft className="h-5 w-5 text-gray-400" />
          )}
          <span className="text-sm text-gray-600">
            {category.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        {category.icon_config && (
          <div className="flex items-center space-x-2">
            <Eye className="h-4 w-4 text-gray-400" />
            <IconRenderer
              name={category.icon_config.name}
              library={category.icon_config.library}
              size={category.icon_config.size || 20}
              color={category.icon_config.color}
              backgroundColor={category.icon_config.backgroundColor}
              padding={category.icon_config.padding}
              animationClass={category.icon_config.animationClass}
            />
            <span className="text-sm text-gray-600">Icon configured</span>
          </div>
        )}
        
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Eye className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Style Preview:</span>
          </div>
          <StylePreview 
            category={category} 
            text="Sample Investment Text" 
            showEffectName={false}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header - Responsive */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-semibold text-gray-900">Investment Categories</h2>
          <p className="text-gray-600">
            {categories.length} categories • Manage visual styles and icons
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium min-h-[44px]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Category
        </button>
      </div>

      {/* Create/Edit Form - Mobile-friendly */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-0 lg:top-10 mx-auto p-0 lg:p-5 border w-full lg:w-4xl h-full lg:h-auto shadow-lg lg:rounded-md bg-white">
            <div className="flex flex-col h-full lg:h-auto">
              <div className="flex items-center justify-between p-4 border-b lg:border-0">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
                <button
                  onClick={resetForm}
                  className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 lg:p-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  defaultValue={formData.name}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                />
              </div>

              {/* Level */}
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                  Level
                </label>
                <select
                  id="level"
                  name="level"
                  defaultValue={formData.level}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                >
                  <option value="bronze">Bronze</option>
                  <option value="silver">Silver</option>
                  <option value="gold">Gold</option>
                  <option value="platinum">Platinum</option>
                </select>
              </div>

              {/* Font Size */}
              <div>
                <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700">
                  Font Size
                </label>
                <select
                  id="fontSize"
                  name="fontSize"
                  value={liveFormData.text_style?.fontSize || 'text-sm'}
                  onChange={(e) => setLiveFormData({
                    ...liveFormData,
                    text_style: { ...liveFormData.text_style, fontSize: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                >
                  <option value="text-xs">Extra Small</option>
                  <option value="text-sm">Small</option>
                  <option value="text-base">Base</option>
                  <option value="text-lg">Large</option>
                  <option value="text-xl">Extra Large</option>
                </select>
              </div>

              {/* Font Weight */}
              <div>
                <label htmlFor="fontWeight" className="block text-sm font-medium text-gray-700">
                  Font Weight
                </label>
                <select
                  id="fontWeight"
                  name="fontWeight"
                  value={liveFormData.text_style?.fontWeight || 'font-normal'}
                  onChange={(e) => setLiveFormData({
                    ...liveFormData,
                    text_style: { ...liveFormData.text_style, fontWeight: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="font-light">Light</option>
                  <option value="font-normal">Normal</option>
                  <option value="font-medium">Medium</option>
                  <option value="font-semibold">Semi Bold</option>
                  <option value="font-bold">Bold</option>
                </select>
              </div>

              {/* Text Color */}
              <div>
                <label htmlFor="textColor" className="block text-sm font-medium text-gray-700">
                  Text Color
                </label>
                <select
                  id="textColor"
                  name="textColor"
                  value={liveFormData.text_style?.textColor || 'text-gray-900'}
                  onChange={(e) => setLiveFormData({
                    ...liveFormData,
                    text_style: { ...liveFormData.text_style, textColor: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="text-gray-900">Gray</option>
                  <option value="text-red-600">Red</option>
                  <option value="text-blue-600">Blue</option>
                  <option value="text-green-600">Green</option>
                  <option value="text-yellow-600">Yellow</option>
                  <option value="text-purple-600">Purple</option>
                  <option value="text-indigo-600">Indigo</option>
                </select>
              </div>

              {/* Premium Effect */}
              <div>
                <label htmlFor="effectClass" className="block text-sm font-medium text-gray-700">
                  Premium Effect
                </label>
                <select
                  id="effectClass"
                  name="effectClass"
                  value={liveFormData.text_style?.effectClass || ''}
                  onChange={(e) => setLiveFormData({
                    ...liveFormData,
                    text_style: { ...liveFormData.text_style, effectClass: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  {PREMIUM_EFFECTS.map(effect => (
                    <option key={effect.value} value={effect.value}>
                      {effect.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom CSS */}
              <div className="col-span-3">
                <label htmlFor="customCSS" className="block text-sm font-medium text-gray-700">
                  Custom CSS (Advanced)
                </label>
                <input
                  type="text"
                  id="customCSS"
                  name="customCSS"
                  placeholder="e.g., text-transform: uppercase; letter-spacing: 2px"
                  value={liveFormData.text_style?.customCSS || ''}
                  onChange={(e) => setLiveFormData({
                    ...liveFormData,
                    text_style: { ...liveFormData.text_style, customCSS: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  CSS properties separated by semicolons. Be careful with this!
                </p>
              </div>
            </div>

            {/* Icon Configuration */}
            <div className="border-t pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Icon Configuration</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Icon
                  </label>
                  <IconPicker
                    value={iconPreviewConfig.name && iconPreviewConfig.library ? {
                      name: iconPreviewConfig.name,
                      library: iconPreviewConfig.library
                    } : undefined}
                    onChange={(icon) => {
                      if (icon) {
                        setIconPreviewConfig({
                          ...iconPreviewConfig,
                          name: icon.name,
                          library: icon.library
                        });
                        setLiveFormData({
                          ...liveFormData,
                          icon_config: {
                            name: icon.name,
                            library: icon.library as 'lucide' | 'heroicons-solid' | 'heroicons-outline' | 'tabler' | 'phosphor',
                            size: iconPreviewConfig.size || 24,
                            color: iconPreviewConfig.color,
                            backgroundColor: iconPreviewConfig.backgroundColor,
                            padding: iconPreviewConfig.padding || 4,
                            animationClass: iconPreviewConfig.animationClass
                          }
                        });
                      } else {
                        setIconPreviewConfig({});
                        setLiveFormData({
                          ...liveFormData,
                          icon_config: null
                        });
                      }
                    }}
                    color={iconPreviewConfig.color}
                  />
                  
                  {/* Hidden form fields for icon data */}
                  <input type="hidden" name="iconName" value={iconPreviewConfig.name || ''} />
                  <input type="hidden" name="iconLibrary" value={iconPreviewConfig.library || ''} />
                  <input type="hidden" name="iconSize" value={iconPreviewConfig.size || 24} />
                  <input type="hidden" name="iconColor" value={iconPreviewConfig.color || ''} />
                  <input type="hidden" name="iconBackgroundColor" value={iconPreviewConfig.backgroundColor || ''} />
                  <input type="hidden" name="iconPadding" value={iconPreviewConfig.padding || 4} />
                  <input type="hidden" name="iconAnimation" value={iconPreviewConfig.animationClass || ''} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label htmlFor="iconSize" className="block text-sm font-medium text-gray-700 mb-2">
                    Icon Size
                  </label>
                  <select
                    id="iconSize"
                    value={iconPreviewConfig.size || 24}
                    onChange={(e) => {
                      const size = parseInt(e.target.value);
                      setIconPreviewConfig({
                        ...iconPreviewConfig,
                        size
                      });
                      if (iconPreviewConfig.name && iconPreviewConfig.library) {
                        setLiveFormData({
                          ...liveFormData,
                          icon_config: {
                            ...liveFormData.icon_config!,
                            size
                          }
                        });
                      }
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value={16}>Small (16px)</option>
                    <option value={20}>Medium (20px)</option>
                    <option value={24}>Default (24px)</option>
                    <option value={32}>Large (32px)</option>
                    <option value={48}>Extra Large (48px)</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="iconAnimation" className="block text-sm font-medium text-gray-700">
                    Animation
                  </label>
                  <select
                    id="iconAnimation"
                    value={iconPreviewConfig.animationClass || ''}
                    onChange={(e) => {
                      setIconPreviewConfig({
                        ...iconPreviewConfig,
                        animationClass: e.target.value
                      });
                      if (iconPreviewConfig.name && iconPreviewConfig.library) {
                        setLiveFormData({
                          ...liveFormData,
                          icon_config: {
                            ...liveFormData.icon_config!,
                            animationClass: e.target.value
                          }
                        });
                      }
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    {ICON_ANIMATIONS.map(animation => (
                      <option key={animation.name} value={animation.className}>
                        {animation.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Color Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div>
                  <label htmlFor="iconColor" className="block text-sm font-medium text-gray-700 mb-2">
                    Icon Color (Foreground)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="iconColor"
                      value={iconPreviewConfig.color || '#000000'}
                      onChange={(e) => {
                        setIconPreviewConfig({
                          ...iconPreviewConfig,
                          color: e.target.value
                        });
                        if (iconPreviewConfig.name && iconPreviewConfig.library) {
                          setLiveFormData({
                            ...liveFormData,
                            icon_config: {
                              ...liveFormData.icon_config!,
                              color: e.target.value
                            }
                          });
                        }
                      }}
                      className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder="#000000"
                      value={iconPreviewConfig.color || ''}
                      onChange={(e) => {
                        setIconPreviewConfig({
                          ...iconPreviewConfig,
                          color: e.target.value
                        });
                        if (iconPreviewConfig.name && iconPreviewConfig.library) {
                          setLiveFormData({
                            ...liveFormData,
                            icon_config: {
                              ...liveFormData.icon_config!,
                              color: e.target.value
                            }
                          });
                        }
                      }}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="iconBackgroundColor" className="block text-sm font-medium text-gray-700">
                    Background Color
                  </label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="color"
                      id="iconBackgroundColor"
                      value={iconPreviewConfig.backgroundColor || '#ffffff'}
                      onChange={(e) => {
                        setIconPreviewConfig({
                          ...iconPreviewConfig,
                          backgroundColor: e.target.value
                        });
                        if (iconPreviewConfig.name && iconPreviewConfig.library) {
                          setLiveFormData({
                            ...liveFormData,
                            icon_config: {
                              ...liveFormData.icon_config!,
                              backgroundColor: e.target.value
                            }
                          });
                        }
                      }}
                      className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder="#ffffff or leave empty"
                      value={iconPreviewConfig.backgroundColor || ''}
                      onChange={(e) => {
                        setIconPreviewConfig({
                          ...iconPreviewConfig,
                          backgroundColor: e.target.value
                        });
                        if (iconPreviewConfig.name && iconPreviewConfig.library) {
                          setLiveFormData({
                            ...liveFormData,
                            icon_config: {
                              ...liveFormData.icon_config!,
                              backgroundColor: e.target.value
                            }
                          });
                        }
                      }}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Leave empty for transparent background</p>
                </div>
                
                <div>
                  <label htmlFor="iconPadding" className="block text-sm font-medium text-gray-700">
                    Background Padding
                  </label>
                  <select
                    id="iconPadding"
                    value={iconPreviewConfig.padding || 4}
                    onChange={(e) => {
                      const padding = parseInt(e.target.value);
                      setIconPreviewConfig({
                        ...iconPreviewConfig,
                        padding
                      });
                      if (iconPreviewConfig.name && iconPreviewConfig.library) {
                        setLiveFormData({
                          ...liveFormData,
                          icon_config: {
                            ...liveFormData.icon_config!,
                            padding
                          }
                        });
                      }
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value={0}>None (0px)</option>
                    <option value={2}>Small (2px)</option>
                    <option value={4}>Default (4px)</option>
                    <option value={6}>Medium (6px)</option>
                    <option value={8}>Large (8px)</option>
                    <option value={12}>Extra Large (12px)</option>
                  </select>
                </div>
              </div>
              
              {/* Icon Preview */}
              {iconPreviewConfig.name && iconPreviewConfig.library && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon Preview
                  </label>
                  <IconPreview
                    name={iconPreviewConfig.name}
                    library={iconPreviewConfig.library}
                    size={iconPreviewConfig.size || 24}
                    color={iconPreviewConfig.color}
                    backgroundColor={iconPreviewConfig.backgroundColor}
                    padding={iconPreviewConfig.padding}
                    animationClass={iconPreviewConfig.animationClass}
                    showLabel={true}
                    className="border border-gray-200 rounded bg-white"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">

              {/* Sort Order */}
              <div>
                <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700 mb-2">
                  Sort Order
                </label>
                <input
                  id="sort_order"
                  name="sort_order"
                  type="number"
                  defaultValue={formData.sort_order}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                />
              </div>
            </div>

            {/* Active Checkbox */}
            <div className="flex items-center mt-6">
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                defaultChecked={formData.is_active}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Active
              </label>
            </div>

            {/* Live Preview */}
            <div className="border-t pt-4">
              <h4 className="text-md font-medium text-gray-900 mb-3">Live Preview</h4>
              <StylePreview 
                category={{ 
                  level: liveFormData.level, 
                  text_style: liveFormData.text_style 
                }} 
                text="Sample Investment Text"
                showEffectName={true}
              />
            </div>

            {/* Form Buttons */}
            <div className="flex flex-col-reverse lg:flex-row gap-2 pt-4 border-t lg:border-0">
              <button
                type="button"
                onClick={resetForm}
                className="w-full lg:w-auto px-4 py-3 lg:py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full lg:w-auto px-4 py-3 lg:py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                {editingCategory ? 'Update Category' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )}

      {/* Responsive Categories Table */}
      <ResponsiveTable
        data={categories}
        columns={columns}
        mobileCard={mobileCard}
        emptyMessage="No categories found. Create your first category above."
      />
    </div>
  );
}
