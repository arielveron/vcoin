/**
 * Category Form Component
 * Complex form for creating/editing investment categories
 * Handles text styling, icon configuration, and live preview
 * Extracted from massive categories-admin-client.tsx
 */
'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useServerAction } from '@/presentation/hooks'
import IconPicker from '@/components/admin/icon-picker'
import IconRenderer from '@/components/icon-renderer'
import type { InvestmentCategory, CreateInvestmentCategoryRequest } from '@/types/database'

const PREMIUM_EFFECTS = [
  { value: "", label: "None" },
  { value: "effect-gradient-gold", label: "Gold Gradient" },
  { value: "effect-gradient-silver", label: "Silver Gradient" },
  { value: "effect-gradient-rainbow", label: "Rainbow Gradient" },
  { value: "effect-gradient-fire", label: "Fire Gradient" },
  { value: "effect-gradient-ice", label: "Ice Gradient" },
  { value: "effect-glow-gold", label: "Gold Glow" },
  { value: "effect-glow-silver", label: "Silver Glow" },
  { value: "effect-glow-neon-blue", label: "Neon Blue Glow" },
  { value: "effect-glow-neon-pink", label: "Neon Pink Glow" },
  { value: "effect-glow-toxic", label: "Toxic Glow" },
  { value: "effect-outline-fire", label: "Fire Outline" },
  { value: "effect-outline-electric", label: "Electric Outline" },
  { value: "effect-outline-shadow", label: "Shadow Outline" },
  { value: "effect-shake", label: "Shake" },
  { value: "effect-sparkle", label: "Sparkle" },
  { value: "effect-holographic", label: "Holographic" },
  { value: "effect-glitch", label: "Glitch" },
  { value: "effect-premium-gold", label: "Premium Gold (Combined)" },
  { value: "effect-premium-platinum", label: "Premium Platinum (Combined)" },
  { value: "effect-premium-legendary", label: "Legendary (All Effects)" },
]

interface CategoryFormProps {
  editingCategory: InvestmentCategory | null
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string }>
  onSuccess: (category: InvestmentCategory) => void
  onCancel: () => void
}

export default function CategoryForm({
  editingCategory,
  onSubmit,
  onSuccess,
  onCancel
}: CategoryFormProps) {
  const { execute, loading } = useServerAction(onSubmit)

  // Form state
  const [formData, setFormData] = useState<CreateInvestmentCategoryRequest>({
    name: editingCategory?.name || "",
    level: editingCategory?.level || "bronze",
    text_style: editingCategory?.text_style || {
      fontSize: "text-sm",
      fontWeight: "font-normal",
      textColor: "text-gray-900",
    },
    icon_config: editingCategory?.icon_config || null,
    is_active: editingCategory?.is_active ?? true,
    sort_order: editingCategory?.sort_order || 0,
  })

  // Live preview state (for real-time updates)
  const [liveFormData, setLiveFormData] = useState<CreateInvestmentCategoryRequest>(formData)

  // Icon preview state
  const [iconPreviewConfig, setIconPreviewConfig] = useState<{
    name?: string
    library?: string
    size?: number
    color?: string
    backgroundColor?: string
    padding?: number
    animationClass?: string
    effectClass?: string
  }>(editingCategory?.icon_config || {})

  // Update live data when editing category changes
  useEffect(() => {
    if (editingCategory) {
      const editData = {
        name: editingCategory.name,
        level: editingCategory.level,
        text_style: editingCategory.text_style,
        icon_config: editingCategory.icon_config,
        is_active: editingCategory.is_active,
        sort_order: editingCategory.sort_order,
      }
      setFormData(editData)
      setLiveFormData(editData)
      setIconPreviewConfig(editingCategory.icon_config || {})
    }
  }, [editingCategory])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formDataObj = new FormData(e.currentTarget)
    
    // Add complex data that can't be sent via form fields
    formDataObj.append('text_style', JSON.stringify(liveFormData.text_style))
    formDataObj.append('icon_config', JSON.stringify(iconPreviewConfig))
    if (editingCategory) {
      formDataObj.append('id', editingCategory.id.toString())
    }

    const result = await execute(formDataObj)
    if (result?.success) {
      // Construct the updated category object for optimistic update
      const updatedCategory: InvestmentCategory = {
        id: editingCategory?.id || Date.now(), // Temporary ID for new categories
        name: formDataObj.get('name') as string,
        level: formDataObj.get('level') as 'bronze' | 'silver' | 'gold' | 'platinum',
        text_style: liveFormData.text_style || {
          fontSize: "text-sm",
          fontWeight: "font-normal",
          textColor: "text-gray-900",
        },
        icon_config: (iconPreviewConfig.name && iconPreviewConfig.library) ? {
          name: iconPreviewConfig.name,
          library: iconPreviewConfig.library as "lucide" | "heroicons-solid" | "heroicons-outline" | "tabler" | "phosphor",
          size: iconPreviewConfig.size,
          color: iconPreviewConfig.color,
          backgroundColor: iconPreviewConfig.backgroundColor,
          padding: iconPreviewConfig.padding,
          animationClass: iconPreviewConfig.animationClass,
          effectClass: iconPreviewConfig.effectClass,
        } : null,
        is_active: formDataObj.get('is_active') === 'true',
        sort_order: parseInt(formDataObj.get('sort_order') as string),
        created_at: editingCategory?.created_at || new Date(),
        updated_at: new Date(),
      }
      onSuccess(updatedCategory)
    } else {
      alert(result?.error || 'Failed to save category')
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-0 lg:top-10 mx-auto p-0 lg:p-5 border w-full lg:w-4xl h-full lg:h-auto shadow-lg lg:rounded-md bg-white">
        <div className="flex flex-col h-full lg:h-auto">
          <div className="flex items-center justify-between p-4 border-b lg:border-0">
            <h3 className="text-lg font-medium text-gray-900">
              {editingCategory ? "Edit Category" : "Create New Category"}
            </h3>
            <button onClick={onCancel} className="lg:hidden p-2 text-gray-400 hover:text-gray-600">
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
            </div>

            {/* Basic Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Status */}
              <div>
                <label htmlFor="is_active" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="is_active"
                  name="is_active"
                  defaultValue={formData.is_active ? "true" : "false"}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700 mb-2">
                  Sort Order
                </label>
                <input
                  id="sort_order"
                  name="sort_order"
                  type="number"
                  min="0"
                  defaultValue={formData.sort_order}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                />
              </div>
            </div>

            {/* Text Styling Section */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Text Styling</h4>
              <div className="space-y-4">
                {/* Font Size and Weight */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700">
                      Font Size
                    </label>
                    <select
                      id="fontSize"
                      value={liveFormData.text_style?.fontSize || "text-sm"}
                      onChange={(e) =>
                        setLiveFormData({
                          ...liveFormData,
                          text_style: { ...liveFormData.text_style, fontSize: e.target.value },
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                    >
                      <option value="text-xs">Extra Small</option>
                      <option value="text-sm">Small</option>
                      <option value="text-base">Base</option>
                      <option value="text-lg">Large</option>
                      <option value="text-xl">Extra Large</option>
                      <option value="text-2xl">2X Large</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="fontWeight" className="block text-sm font-medium text-gray-700">
                      Font Weight
                    </label>
                    <select
                      id="fontWeight"
                      value={liveFormData.text_style?.fontWeight || "font-normal"}
                      onChange={(e) =>
                        setLiveFormData({
                          ...liveFormData,
                          text_style: { ...liveFormData.text_style, fontWeight: e.target.value },
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                    >
                      <option value="font-thin">Thin</option>
                      <option value="font-light">Light</option>
                      <option value="font-normal">Normal</option>
                      <option value="font-medium">Medium</option>
                      <option value="font-semibold">Semibold</option>
                      <option value="font-bold">Bold</option>
                      <option value="font-extrabold">Extra Bold</option>
                    </select>
                  </div>
                </div>

                {/* Text Color */}
                <div>
                  <label htmlFor="textColor" className="block text-sm font-medium text-gray-700 mb-2">
                    Text Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={
                        liveFormData.text_style?.textColor?.startsWith("#")
                          ? liveFormData.text_style.textColor
                          : "#111827"
                      }
                      onChange={(e) => {
                        const hexColor = e.target.value
                        setLiveFormData({
                          ...liveFormData,
                          text_style: { ...liveFormData.text_style, textColor: hexColor },
                        })
                      }}
                      className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      id="textColor"
                      placeholder="#000000"
                      value={liveFormData.text_style?.textColor || ""}
                      onChange={(e) =>
                        setLiveFormData({
                          ...liveFormData,
                          text_style: { ...liveFormData.text_style, textColor: e.target.value },
                        })
                      }
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-3 lg:py-2"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Use color picker or enter hex value (e.g. #FF0000)</p>
                </div>

                {/* Premium Effect */}
                <div>
                  <label htmlFor="effectClass" className="block text-sm font-medium text-gray-700">
                    Premium Effect
                  </label>
                  <select
                    id="effectClass"
                    value={liveFormData.text_style?.effectClass || ""}
                    onChange={(e) =>
                      setLiveFormData({
                        ...liveFormData,
                        text_style: { ...liveFormData.text_style, effectClass: e.target.value },
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                  >
                    {PREMIUM_EFFECTS.map((effect) => (
                      <option key={effect.value} value={effect.value}>
                        {effect.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Icon Configuration Section */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Icon Configuration</h4>
              <div className="space-y-4">
                <IconPicker
                  value={iconPreviewConfig.name && iconPreviewConfig.library ? {
                    name: iconPreviewConfig.name,
                    library: iconPreviewConfig.library
                  } : undefined}
                  onChange={(iconData) => {
                    if (iconData) {
                      setIconPreviewConfig({
                        ...iconPreviewConfig,
                        name: iconData.name,
                        library: iconData.library,
                      })
                    } else {
                      setIconPreviewConfig({})
                    }
                  }}
                />

                {iconPreviewConfig.name && iconPreviewConfig.library && (
                  <div className="space-y-4">
                    <h5 className="text-md font-medium text-gray-900">Icon Settings</h5>
                    
                    {/* Icon Size */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Icon Size
                      </label>
                      <input
                        type="range"
                        min="16"
                        max="64"
                        value={iconPreviewConfig.size || 24}
                        onChange={(e) => setIconPreviewConfig({
                          ...iconPreviewConfig,
                          size: parseInt(e.target.value)
                        })}
                        className="w-full"
                      />
                      <span className="text-sm text-gray-500">{iconPreviewConfig.size || 24}px</span>
                    </div>

                    {/* Icon Color */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Icon Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={iconPreviewConfig.color || "#000000"}
                          onChange={(e) => setIconPreviewConfig({
                            ...iconPreviewConfig,
                            color: e.target.value
                          })}
                          className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          placeholder="#000000"
                          value={iconPreviewConfig.color || ""}
                          onChange={(e) => setIconPreviewConfig({
                            ...iconPreviewConfig,
                            color: e.target.value
                          })}
                          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2"
                        />
                      </div>
                    </div>

                    {/* Icon Preview */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preview
                      </label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <IconRenderer
                          name={iconPreviewConfig.name}
                          library={iconPreviewConfig.library}
                          size={iconPreviewConfig.size || 24}
                          color={iconPreviewConfig.color}
                          backgroundColor={iconPreviewConfig.backgroundColor}
                          padding={iconPreviewConfig.padding}
                          animationClass={iconPreviewConfig.animationClass}
                          effectClass={iconPreviewConfig.effectClass}
                        />
                        <span className="text-sm text-gray-600">
                          {iconPreviewConfig.name} ({iconPreviewConfig.library})
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Live Preview Section */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Combined Live Preview</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-lg ${liveFormData.text_style?.fontSize || "text-sm"} ${
                      liveFormData.text_style?.fontWeight || "font-normal"
                    } ${liveFormData.text_style?.effectClass || ""}`}
                    style={{
                      color: liveFormData.text_style?.textColor?.startsWith("#")
                        ? liveFormData.text_style.textColor
                        : undefined,
                    }}
                  >
                    Sample Investment Category
                  </span>
                  {iconPreviewConfig.name && iconPreviewConfig.library && (
                    <IconRenderer
                      name={iconPreviewConfig.name}
                      library={iconPreviewConfig.library}
                      size={iconPreviewConfig.size || 24}
                      color={iconPreviewConfig.color}
                      backgroundColor={iconPreviewConfig.backgroundColor}
                      padding={iconPreviewConfig.padding}
                      animationClass={iconPreviewConfig.animationClass}
                      effectClass={iconPreviewConfig.effectClass}
                    />
                  )}
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {liveFormData.level}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This is how your category will appear in the investment displays
                </p>
              </div>
            </div>

            {/* Form Buttons */}
            <div className="flex flex-col-reverse lg:flex-row gap-2 pt-4 border-t lg:border-0">
              <button
                type="button"
                onClick={onCancel}
                className="w-full lg:w-auto px-4 py-3 lg:py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full lg:w-auto px-4 py-3 lg:py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (editingCategory ? "Update Category" : "Create Category")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
