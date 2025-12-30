'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X, Plus, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

/**
 * TechStackManager - Quản lý công nghệ sử dụng trong project
 * Hỗ trợ add, reorder, delete tech items
 */

interface TechItem {
  id: string // project_tech_stack.id
  name: string // e.g., "Next.js", "React", "TypeScript"
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'tools' | 'other'
  icon?: string // Lucide icon name (optional)
  order_index: number
}

interface TechStackManagerProps {
  projectId?: string
  initialTechStack?: TechItem[]
  onTechStackChange?: (techStack: TechItem[]) => void
}

const CATEGORIES = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'database', label: 'Database' },
  { value: 'devops', label: 'DevOps' },
  { value: 'tools', label: 'Tools' },
  { value: 'other', label: 'Khác' },
] as const

export function TechStackManager({
  projectId,
  initialTechStack = [],
  onTechStackChange,
}: TechStackManagerProps) {
  const [techStack, setTechStack] = useState<TechItem[]>(initialTechStack)
  const [newTech, setNewTech] = useState<{ name: string; category: TechItem['category'] }>({
    name: '',
    category: 'frontend',
  })
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Sync tech stack changes to parent
  useEffect(() => {
    onTechStackChange?.(techStack)
  }, [techStack, onTechStackChange])

  const handleAdd = () => {
    if (!newTech.name.trim()) {
      toast.error('Vui lòng nhập tên công nghệ')
      return
    }

    const newItem: TechItem = {
      id: `temp-${Date.now()}`, // Temporary ID
      name: newTech.name.trim(),
      category: newTech.category,
      order_index: techStack.length,
    }

    setTechStack((prev) => [...prev, newItem])
    setNewTech({ name: '', category: 'frontend' })
    toast.success(`Đã thêm ${newItem.name}`)
  }

  const handleRemove = (index: number) => {
    const removedName = techStack[index]?.name
    if (!removedName) return
    setTechStack((prev) => {
      const updated = prev.filter((_, i) => i !== index)
      // Reorder indices
      return updated.map((item, i) => ({ ...item, order_index: i }))
    })
    toast.success(`Đã xóa ${removedName}`)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newTechStack = [...techStack]
    const draggedItem = newTechStack[draggedIndex]
    if (!draggedItem) return
    newTechStack.splice(draggedIndex, 1)
    newTechStack.splice(index, 0, draggedItem)

    // Update order indices
    const reorderedTechStack = newTechStack.map((item, i) => ({
      ...item,
      order_index: i,
    }))

    setTechStack(reorderedTechStack)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'frontend':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      case 'backend':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 'database':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
      case 'devops':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
      case 'tools':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  return (
    <div className="space-y-4">
      {/* Add New Tech */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Tên công nghệ (vd: Next.js, React)"
              value={newTech.name}
              onChange={(e) => setNewTech({ ...newTech, name: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAdd()
                }
              }}
              className="flex-1"
            />
            <Select
              value={newTech.category}
              onValueChange={(value) =>
                setNewTech({ ...newTech, category: value as TechItem['category'] })
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" onClick={handleAdd}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tech Stack List */}
      {techStack.length > 0 && (
        <div className="grid gap-2">
          {techStack.map((item, index) => (
            <Card
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                'cursor-move transition-shadow hover:shadow-md',
                draggedIndex === index && 'opacity-50'
              )}
            >
              <CardContent className="flex items-center gap-3 p-3">
                {/* Drag Handle */}
                <GripVertical className="h-4 w-4 text-muted-foreground" />

                {/* Order Badge */}
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {index + 1}
                </div>

                {/* Tech Name */}
                <div className="flex-1 font-medium">{item.name}</div>

                {/* Category Badge */}
                <div
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium',
                    getCategoryColor(item.category)
                  )}
                >
                  {CATEGORIES.find((c) => c.value === item.category)?.label}
                </div>

                {/* Remove Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleRemove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {techStack.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Chưa có công nghệ nào. Nhập tên và nhấn Enter hoặc nút + để thêm.
        </p>
      )}
    </div>
  )
}
