'use client'

import { useMemo, useState } from 'react'
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import type { Database } from '@/types/database'
import {
  createAboutSection,
  createSkill,
  createTimelineEvent,
  deleteAboutSection,
  deleteSkill,
  deleteTimelineEvent,
  updateAboutSection,
  updateSkill,
  updateTimelineEvent,
} from '@/app/actions/admin-about'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type AboutSection = Database['public']['Tables']['about_sections']['Row']
type TimelineEvent = Database['public']['Tables']['timeline_events']['Row']
type Skill = Database['public']['Tables']['skills']['Row']

type AboutSectionInsert =
  Database['public']['Tables']['about_sections']['Insert']
type AboutSectionUpdate =
  Database['public']['Tables']['about_sections']['Update']

type TimelineEventInsert =
  Database['public']['Tables']['timeline_events']['Insert']
type TimelineEventUpdate =
  Database['public']['Tables']['timeline_events']['Update']

type SkillInsert = Database['public']['Tables']['skills']['Insert']
type SkillUpdate = Database['public']['Tables']['skills']['Update']

interface AboutAdminClientProps {
  locale: string
  initialSections: AboutSection[]
  initialTimeline: TimelineEvent[]
  initialSkills: Skill[]
}

type EntityType = 'about_sections' | 'timeline_events' | 'skills'

interface DeleteState {
  open: boolean
  entityType: EntityType | null
  entityId: string | null
  title: string
}

const timelineEventTypeOptions = [
  { value: 'work', label: 'Công việc' },
  { value: 'education', label: 'Học tập' },
  { value: 'achievement', label: 'Thành tựu' },
] as const

const allowedSkillCategories = ['frontend', 'backend', 'tools'] as const

function isAllowedSkillCategory(
  value: string
): value is (typeof allowedSkillCategories)[number] {
  return (allowedSkillCategories as readonly string[]).includes(value)
}

function toNullableNumber(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const num = Number(trimmed)
  return Number.isFinite(num) ? num : null
}

function toNullableString(value: string): string | null {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export function AboutAdminClient({
  locale,
  initialSections,
  initialTimeline,
  initialSkills,
}: AboutAdminClientProps) {
  const t = useTranslations('admin.about')

  const [sections, setSections] = useState<AboutSection[]>(initialSections)
  const [timeline, setTimeline] = useState<TimelineEvent[]>(initialTimeline)
  const [skills, setSkills] = useState<Skill[]>(initialSkills)

  const [deleteState, setDeleteState] = useState<DeleteState>({
    open: false,
    entityType: null,
    entityId: null,
    title: '',
  })

  const [sectionDialogOpen, setSectionDialogOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<AboutSection | null>(
    null
  )

  const [timelineDialogOpen, setTimelineDialogOpen] = useState(false)
  const [editingTimeline, setEditingTimeline] = useState<TimelineEvent | null>(
    null
  )

  const [skillDialogOpen, setSkillDialogOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)

  const groupedSkills = useMemo(() => {
    const map = new Map<string, Skill[]>()
    for (const skill of skills) {
      const key = skill.category || 'other'
      const arr = map.get(key) || []
      arr.push(skill)
      map.set(key, arr)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [skills])

  const handleDelete = async () => {
    if (!deleteState.entityType || !deleteState.entityId) return

    try {
      if (deleteState.entityType === 'about_sections') {
        await deleteAboutSection(locale, deleteState.entityId)
        setSections(prev => prev.filter(s => s.id !== deleteState.entityId))
      }

      if (deleteState.entityType === 'timeline_events') {
        await deleteTimelineEvent(locale, deleteState.entityId)
        setTimeline(prev => prev.filter(e => e.id !== deleteState.entityId))
      }

      if (deleteState.entityType === 'skills') {
        await deleteSkill(locale, deleteState.entityId)
        setSkills(prev => prev.filter(s => s.id !== deleteState.entityId))
      }

      toast.success(t('messages.delete_success'))
      setDeleteState(prev => ({ ...prev, open: false }))
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('messages.delete_error')
      )
    }
  }

  return (
    <div className="grid gap-6">
      {/* About Sections */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>{t('sections.title')}</CardTitle>
            <CardDescription>{t('sections.description')}</CardDescription>
          </div>
          <Button
            onClick={() => {
              setEditingSection(null)
              setSectionDialogOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('actions.create_section')}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('sections.table.section_key')}</TableHead>
                  <TableHead>{t('sections.table.title')}</TableHead>
                  <TableHead>{t('sections.table.visible')}</TableHead>
                  <TableHead className="w-[80px]">
                    {t('common.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sections.length ? (
                  sections.map(s => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <code className="rounded bg-muted px-2 py-1 text-xs">
                          {s.section_key}
                        </code>
                      </TableCell>
                      <TableCell className="font-medium">{s.title}</TableCell>
                      <TableCell>
                        {s.visible ? t('common.yes') : t('common.no')}
                      </TableCell>
                      <TableCell>
                        <RowActions
                          onDelete={() =>
                            setDeleteState({
                              open: true,
                              entityType: 'about_sections',
                              entityId: s.id,
                              title: s.title,
                            })
                          }
                          onEdit={() => {
                            setEditingSection(s)
                            setSectionDialogOpen(true)
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      className="h-24 text-center text-muted-foreground"
                      colSpan={4}
                    >
                      {t('common.empty')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>{t('timeline.title')}</CardTitle>
            <CardDescription>{t('timeline.description')}</CardDescription>
          </div>
          <Button
            onClick={() => {
              setEditingTimeline(null)
              setTimelineDialogOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('actions.create_timeline')}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('timeline.table.title')}</TableHead>
                  <TableHead>{t('timeline.table.type')}</TableHead>
                  <TableHead>{t('timeline.table.start_date')}</TableHead>
                  <TableHead>{t('timeline.table.current')}</TableHead>
                  <TableHead className="w-[80px]">
                    {t('common.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeline.length ? (
                  timeline.map(e => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.title}</TableCell>
                      <TableCell>
                        {timelineEventTypeOptions.find(
                          x => x.value === e.event_type
                        )?.label || e.event_type}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs">{e.start_date}</code>
                      </TableCell>
                      <TableCell>
                        {e.is_current ? t('common.yes') : t('common.no')}
                      </TableCell>
                      <TableCell>
                        <RowActions
                          onDelete={() =>
                            setDeleteState({
                              open: true,
                              entityType: 'timeline_events',
                              entityId: e.id,
                              title: e.title,
                            })
                          }
                          onEdit={() => {
                            setEditingTimeline(e)
                            setTimelineDialogOpen(true)
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      className="h-24 text-center text-muted-foreground"
                      colSpan={5}
                    >
                      {t('common.empty')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>{t('skills.title')}</CardTitle>
            <CardDescription>{t('skills.description')}</CardDescription>
          </div>
          <Button
            onClick={() => {
              setEditingSkill(null)
              setSkillDialogOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('actions.create_skill')}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {groupedSkills.length ? (
            groupedSkills.map(([category, items]) => (
              <div className="space-y-2" key={category}>
                <div className="text-sm font-semibold">{category}</div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('skills.table.name')}</TableHead>
                        <TableHead>{t('skills.table.proficiency')}</TableHead>
                        <TableHead className="w-[80px]">
                          {t('common.actions')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map(s => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">
                            {s.name}
                          </TableCell>
                          <TableCell>
                            {typeof s.proficiency === 'number'
                              ? `${s.proficiency}%`
                              : t('common.na')}
                          </TableCell>
                          <TableCell>
                            <RowActions
                              onDelete={() =>
                                setDeleteState({
                                  open: true,
                                  entityType: 'skills',
                                  entityId: s.id,
                                  title: s.name,
                                })
                              }
                              onEdit={() => {
                                setEditingSkill(s)
                                setSkillDialogOpen(true)
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">
              {t('common.empty')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirm */}
      <AlertDialog
        onOpenChange={open => {
          if (!open) {
            setDeleteState(prev => ({ ...prev, open: false }))
          }
        }}
        open={deleteState.open}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete.confirm_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('delete.confirm_description', { title: deleteState.title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {t('actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AboutSectionDialog
        editing={editingSection}
        locale={locale}
        onCreated={created => setSections(prev => [created, ...prev])}
        onOpenChange={setSectionDialogOpen}
        onUpdated={updated =>
          setSections(prev =>
            prev.map(s => (s.id === updated.id ? updated : s))
          )
        }
        open={sectionDialogOpen}
      />

      <TimelineEventDialog
        editing={editingTimeline}
        locale={locale}
        onCreated={created => setTimeline(prev => [created, ...prev])}
        onOpenChange={setTimelineDialogOpen}
        onUpdated={updated =>
          setTimeline(prev =>
            prev.map(e => (e.id === updated.id ? updated : e))
          )
        }
        open={timelineDialogOpen}
      />

      <SkillDialog
        editing={editingSkill}
        locale={locale}
        onCreated={created => setSkills(prev => [created, ...prev])}
        onOpenChange={setSkillDialogOpen}
        onUpdated={updated =>
          setSkills(prev => prev.map(s => (s.id === updated.id ? updated : s)))
        }
        open={skillDialogOpen}
      />
    </div>
  )
}

function RowActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void
  onDelete: () => void
}) {
  const t = useTranslations('admin.about')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="h-8 w-8 p-0" variant="ghost">
          <span className="sr-only">{t('common.open_menu')}</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          {t('actions.edit')}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {t('actions.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function AboutSectionDialog({
  locale,
  open,
  onOpenChange,
  editing,
  onCreated,
  onUpdated,
}: {
  locale: string
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: AboutSection | null
  onCreated: (created: AboutSection) => void
  onUpdated: (updated: AboutSection) => void
}) {
  const t = useTranslations('admin.about')
  const [isSaving, setIsSaving] = useState(false)

  const [sectionKey, setSectionKey] = useState(editing?.section_key ?? '')
  const [title, setTitle] = useState(editing?.title ?? '')
  const [content, setContent] = useState(editing?.content ?? '')
  const [visible, setVisible] = useState(editing?.visible ?? true)
  const [orderIndex, setOrderIndex] = useState(
    editing?.order_index?.toString() ?? ''
  )

  const isEdit = Boolean(editing)

  const resetFromEditing = () => {
    setSectionKey(editing?.section_key ?? '')
    setTitle(editing?.title ?? '')
    setContent(editing?.content ?? '')
    setVisible(editing?.visible ?? true)
    setOrderIndex(editing?.order_index?.toString() ?? '')
  }

  const handleSave = async () => {
    if (!sectionKey.trim() || !title.trim()) {
      toast.error(t('messages.required_fields'))
      return
    }

    setIsSaving(true)
    try {
      if (isEdit && editing) {
        const payload: AboutSectionUpdate = {
          section_key: sectionKey.trim(),
          title: title.trim(),
          content: toNullableString(content),
          visible,
          order_index: toNullableNumber(orderIndex),
        }
        const updated = (await updateAboutSection(
          locale,
          editing.id,
          payload
        )) as AboutSection
        onUpdated(updated)
        toast.success(t('messages.update_success'))
      } else {
        const payload: AboutSectionInsert = {
          locale,
          section_key: sectionKey.trim(),
          title: title.trim(),
          content: toNullableString(content),
          visible,
          order_index: toNullableNumber(orderIndex),
        }
        const created = (await createAboutSection(
          locale,
          payload
        )) as AboutSection
        onCreated(created)
        toast.success(t('messages.create_success'))
      }

      onOpenChange(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('messages.save_error')
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog
      onOpenChange={next => {
        onOpenChange(next)
        if (next) resetFromEditing()
      }}
      open={open}
    >
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? t('sections.dialog.edit_title')
              : t('sections.dialog.create_title')}
          </DialogTitle>
          <DialogDescription>
            {t('sections.dialog.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="section_key">
              {t('sections.form.section_key')}
            </Label>
            <Input
              id="section_key"
              onChange={e => setSectionKey(e.target.value)}
              placeholder="bio, contact, ..."
              value={sectionKey}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="title">{t('sections.form.title')}</Label>
            <Input
              id="title"
              onChange={e => setTitle(e.target.value)}
              placeholder={t('sections.form.title_placeholder')}
              value={title}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="content">{t('sections.form.content')}</Label>
            <Textarea
              className="min-h-[160px]"
              id="content"
              onChange={e => setContent(e.target.value)}
              placeholder={t('sections.form.content_placeholder')}
              value={content}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="order_index">
                {t('sections.form.order_index')}
              </Label>
              <Input
                id="order_index"
                onChange={e => setOrderIndex(e.target.value)}
                placeholder="0"
                type="number"
                value={orderIndex}
              />
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="grid gap-0.5">
                <div className="text-sm font-medium">
                  {t('sections.form.visible')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t('sections.form.visible_hint')}
                </div>
              </div>
              <Switch checked={visible} onCheckedChange={setVisible} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            {t('actions.cancel')}
          </Button>
          <Button disabled={isSaving} onClick={handleSave}>
            {isSaving ? t('actions.saving') : t('actions.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function TimelineEventDialog({
  locale,
  open,
  onOpenChange,
  editing,
  onCreated,
  onUpdated,
}: {
  locale: string
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: TimelineEvent | null
  onCreated: (created: TimelineEvent) => void
  onUpdated: (updated: TimelineEvent) => void
}) {
  const t = useTranslations('admin.about')
  const [isSaving, setIsSaving] = useState(false)

  const [title, setTitle] = useState(editing?.title ?? '')
  const [subtitle, setSubtitle] = useState(editing?.subtitle ?? '')
  const [description, setDescription] = useState(editing?.description ?? '')
  const [eventType, setEventType] = useState(editing?.event_type ?? 'work')
  const [startDate, setStartDate] = useState(editing?.start_date ?? '')
  const [endDate, setEndDate] = useState(editing?.end_date ?? '')
  const [isCurrent, setIsCurrent] = useState(editing?.is_current ?? false)
  const [orderIndex, setOrderIndex] = useState(
    editing?.order_index?.toString() ?? ''
  )

  const isEdit = Boolean(editing)

  const resetFromEditing = () => {
    setTitle(editing?.title ?? '')
    setSubtitle(editing?.subtitle ?? '')
    setDescription(editing?.description ?? '')
    setEventType(editing?.event_type ?? 'work')
    setStartDate(editing?.start_date ?? '')
    setEndDate(editing?.end_date ?? '')
    setIsCurrent(editing?.is_current ?? false)
    setOrderIndex(editing?.order_index?.toString() ?? '')
  }

  const handleSave = async () => {
    if (!title.trim() || !eventType.trim() || !startDate.trim()) {
      toast.error(t('messages.required_fields'))
      return
    }

    setIsSaving(true)
    try {
      if (isEdit && editing) {
        const payload: TimelineEventUpdate = {
          title: title.trim(),
          subtitle: toNullableString(subtitle),
          description: toNullableString(description),
          event_type: eventType,
          start_date: startDate,
          end_date: toNullableString(endDate),
          is_current: isCurrent,
          order_index: toNullableNumber(orderIndex),
        }
        const updated = (await updateTimelineEvent(
          locale,
          editing.id,
          payload
        )) as TimelineEvent
        onUpdated(updated)
        toast.success(t('messages.update_success'))
      } else {
        const payload: TimelineEventInsert = {
          locale,
          title: title.trim(),
          subtitle: toNullableString(subtitle),
          description: toNullableString(description),
          event_type: eventType,
          start_date: startDate,
          end_date: toNullableString(endDate),
          is_current: isCurrent,
          order_index: toNullableNumber(orderIndex),
        }
        const created = (await createTimelineEvent(
          locale,
          payload
        )) as TimelineEvent
        onCreated(created)
        toast.success(t('messages.create_success'))
      }

      onOpenChange(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('messages.save_error')
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog
      onOpenChange={next => {
        onOpenChange(next)
        if (next) resetFromEditing()
      }}
      open={open}
    >
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? t('timeline.dialog.edit_title')
              : t('timeline.dialog.create_title')}
          </DialogTitle>
          <DialogDescription>
            {t('timeline.dialog.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="timeline_title">{t('timeline.form.title')}</Label>
            <Input
              id="timeline_title"
              onChange={e => setTitle(e.target.value)}
              placeholder={t('timeline.form.title_placeholder')}
              value={title}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="timeline_subtitle">
              {t('timeline.form.subtitle')}
            </Label>
            <Input
              id="timeline_subtitle"
              onChange={e => setSubtitle(e.target.value)}
              placeholder={t('timeline.form.subtitle_placeholder')}
              value={subtitle}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="timeline_description">
              {t('timeline.form.description')}
            </Label>
            <Textarea
              className="min-h-[120px]"
              id="timeline_description"
              onChange={e => setDescription(e.target.value)}
              placeholder={t('timeline.form.description_placeholder')}
              value={description}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>{t('timeline.form.event_type')}</Label>
              <Select onValueChange={setEventType} value={eventType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timelineEventTypeOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="timeline_order">
                {t('timeline.form.order_index')}
              </Label>
              <Input
                id="timeline_order"
                onChange={e => setOrderIndex(e.target.value)}
                placeholder="0"
                type="number"
                value={orderIndex}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="timeline_start">
                {t('timeline.form.start_date')}
              </Label>
              <Input
                id="timeline_start"
                onChange={e => setStartDate(e.currentTarget.value)}
                onInput={e => setStartDate(e.currentTarget.value)}
                type="date"
                value={startDate}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="timeline_end">
                {t('timeline.form.end_date')}
              </Label>
              <Input
                disabled={isCurrent}
                id="timeline_end"
                onChange={e => setEndDate(e.currentTarget.value)}
                onInput={e => setEndDate(e.currentTarget.value)}
                type="date"
                value={endDate}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="grid gap-0.5">
              <div className="text-sm font-medium">
                {t('timeline.form.is_current')}
              </div>
              <div className="text-xs text-muted-foreground">
                {t('timeline.form.is_current_hint')}
              </div>
            </div>
            <Switch
              checked={isCurrent}
              onCheckedChange={checked => {
                setIsCurrent(checked)
                if (checked) setEndDate('')
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            {t('actions.cancel')}
          </Button>
          <Button disabled={isSaving} onClick={handleSave}>
            {isSaving ? t('actions.saving') : t('actions.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SkillDialog({
  locale,
  open,
  onOpenChange,
  editing,
  onCreated,
  onUpdated,
}: {
  locale: string
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: Skill | null
  onCreated: (created: Skill) => void
  onUpdated: (updated: Skill) => void
}) {
  const t = useTranslations('admin.about')
  const [isSaving, setIsSaving] = useState(false)

  const [name, setName] = useState(editing?.name ?? '')
  const [category, setCategory] = useState(editing?.category ?? '')
  const [proficiency, setProficiency] = useState(
    typeof editing?.proficiency === 'number' ? String(editing.proficiency) : ''
  )
  const [orderIndex, setOrderIndex] = useState(
    editing?.order_index?.toString() ?? ''
  )
  const [icon, setIcon] = useState(editing?.icon ?? '')
  const [color, setColor] = useState(editing?.color ?? '')

  const isEdit = Boolean(editing)

  const resetFromEditing = () => {
    setName(editing?.name ?? '')
    setCategory(editing?.category ?? '')
    setProficiency(
      typeof editing?.proficiency === 'number'
        ? String(editing.proficiency)
        : ''
    )
    setOrderIndex(editing?.order_index?.toString() ?? '')
    setIcon(editing?.icon ?? '')
    setColor(editing?.color ?? '')
  }

  const handleSave = async () => {
    const normalizedName = name.trim()
    const normalizedCategory = category.trim()

    if (!normalizedName || !normalizedCategory) {
      toast.error(t('messages.required_fields'))
      return
    }

    if (!isAllowedSkillCategory(normalizedCategory)) {
      toast.error(t('messages.invalid_skill_category'))
      return
    }

    setIsSaving(true)
    try {
      if (isEdit && editing) {
        const payload: SkillUpdate = {
          name: normalizedName,
          category: normalizedCategory,
          proficiency: toNullableNumber(proficiency),
          order_index: toNullableNumber(orderIndex),
          icon: toNullableString(icon),
          color: toNullableString(color),
        }
        const updated = (await updateSkill(
          locale,
          editing.id,
          payload
        )) as Skill
        onUpdated(updated)
        toast.success(t('messages.update_success'))
      } else {
        const payload: SkillInsert = {
          name: normalizedName,
          category: normalizedCategory,
          proficiency: toNullableNumber(proficiency),
          order_index: toNullableNumber(orderIndex),
          icon: toNullableString(icon),
          color: toNullableString(color),
        }
        const created = (await createSkill(locale, payload)) as Skill
        onCreated(created)
        toast.success(t('messages.create_success'))
      }

      onOpenChange(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('messages.save_error')
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog
      onOpenChange={next => {
        onOpenChange(next)
        if (next) resetFromEditing()
      }}
      open={open}
    >
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? t('skills.dialog.edit_title')
              : t('skills.dialog.create_title')}
          </DialogTitle>
          <DialogDescription>
            {t('skills.dialog.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="skill_name">{t('skills.form.name')}</Label>
            <Input
              id="skill_name"
              onChange={e => setName(e.target.value)}
              placeholder={t('skills.form.name_placeholder')}
              value={name}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="skill_category">{t('skills.form.category')}</Label>
            <Input
              id="skill_category"
              onChange={e => setCategory(e.target.value)}
              placeholder={t('skills.form.category_placeholder')}
              value={category}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="skill_proficiency">
                {t('skills.form.proficiency')}
              </Label>
              <Input
                id="skill_proficiency"
                max={100}
                min={0}
                onChange={e => setProficiency(e.target.value)}
                placeholder="0-100"
                type="number"
                value={proficiency}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="skill_order">
                {t('skills.form.order_index')}
              </Label>
              <Input
                id="skill_order"
                onChange={e => setOrderIndex(e.target.value)}
                placeholder="0"
                type="number"
                value={orderIndex}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="skill_icon">{t('skills.form.icon')}</Label>
              <Input
                id="skill_icon"
                onChange={e => setIcon(e.target.value)}
                placeholder={t('skills.form.icon_placeholder')}
                value={icon}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="skill_color">{t('skills.form.color')}</Label>
              <Input
                id="skill_color"
                onChange={e => setColor(e.target.value)}
                placeholder={t('skills.form.color_placeholder')}
                value={color}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            {t('actions.cancel')}
          </Button>
          <Button disabled={isSaving} onClick={handleSave}>
            {isSaving ? t('actions.saving') : t('actions.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
