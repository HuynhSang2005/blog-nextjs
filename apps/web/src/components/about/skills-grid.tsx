'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { DynamicIcon, iconNames, type IconName } from 'lucide-react/dynamic'

interface Skill {
  id: string
  name: string
  category: 'frontend' | 'backend' | 'tools' | 'soft_skills' | 'other'
  proficiency: number | null
  icon: string | null
  color: string | null
  order_index: number
  created_at: string
}

interface SkillsGridProps {
  skills: Skill[]
}

interface SkillCardProps {
  skill: Skill
}

function SkillCard({ skill }: SkillCardProps) {
  const t = useTranslations('about.skills')

  const iconName =
    skill.icon && iconNames.includes(skill.icon as IconName)
      ? (skill.icon as IconName)
      : null

  // Default color if none specified
  const badgeStyle = skill.color
    ? {
        backgroundColor: `${skill.color}20`,
        borderColor: skill.color,
        color: skill.color,
      }
    : undefined

  return (
    <Card className="group transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold leading-tight">
            {skill.name}
          </CardTitle>
          {iconName && (
            <div
              className={cn(
                'rounded-lg p-2 transition-colors',
                'group-hover:bg-primary/10'
              )}
              style={
                skill.color
                  ? {
                      backgroundColor: `${skill.color}15`,
                      color: skill.color,
                    }
                  : undefined
              }
            >
              <DynamicIcon className="h-5 w-5" name={iconName} />
            </div>
          )}
        </div>
      </CardHeader>

      {skill.proficiency !== null && (
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('proficiency')}</span>
            <Badge style={badgeStyle} variant="secondary">
              {skill.proficiency}%
            </Badge>
          </div>
          <Progress
            className="h-2"
            style={
              skill.color
                ? ({
                    '--progress-background': skill.color,
                  } as React.CSSProperties)
                : undefined
            }
            value={skill.proficiency}
          />
        </CardContent>
      )}
    </Card>
  )
}

function groupSkillsByCategory(skills: Skill[]) {
  return skills.reduce(
    (acc, skill) => {
      const category = skill.category || 'other'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(skill)
      return acc
    },
    {} as Record<string, Skill[]>
  )
}

export function SkillsGrid({ skills }: SkillsGridProps) {
  const t = useTranslations('about.skills')

  if (!skills || skills.length === 0) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        <p>Chưa có kỹ năng nào được thêm</p>
      </div>
    )
  }

  const groupedSkills = groupSkillsByCategory(skills)
  const categories = Object.keys(groupedSkills).filter(
    key => groupedSkills[key] && groupedSkills[key].length > 0
  ) as Array<'frontend' | 'backend' | 'tools' | 'soft_skills' | 'other'>

  return (
    <div className="space-y-12">
      {categories.map(category => {
        const categorySkills = groupedSkills[category]
        if (!categorySkills || categorySkills.length === 0) {
          return null
        }

        return (
          <div key={category}>
            <h3 className="mb-6 text-2xl font-bold">
              {t(`categories.${category}`)}
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categorySkills.map(skill => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
