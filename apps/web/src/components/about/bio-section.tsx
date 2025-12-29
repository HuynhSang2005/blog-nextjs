'use client'

import { CldImage } from 'next-cloudinary'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Briefcase, Mail, Calendar } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface BioSectionProps {
  content: string
  profile: {
    full_name: string | null
    bio: string | null
    email: string | null
    avatar_media: {
      public_id: string
      alt_text: string | null
      width: number
      height: number
    } | null
    github_username: string | null
    twitter_username: string | null
    website: string | null
    created_at: string
  }
}

interface InfoCardProps {
  icon: React.ElementType
  label: string
  value: string | null
  className?: string
}

function InfoCard({ icon: Icon, label, value, className }: InfoCardProps) {
  if (!value) return null

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50',
        className
      )}
    >
      <Icon className="mt-0.5 h-5 w-5 text-muted-foreground" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-base font-semibold">{value}</p>
      </div>
    </div>
  )
}

export function BioSection({ content, profile }: BioSectionProps) {
  const t = useTranslations('about.bio')

  // Calculate years of experience (từ created_at)
  const createdDate = new Date(profile.created_at)
  const currentDate = new Date()
  const yearsOfExperience = Math.floor(
    (currentDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
  )

  return (
    <section className="mt-12">
      <div className="grid gap-8 md:grid-cols-12">
        {/* Avatar - Smaller column */}
        <div className="md:col-span-4">
          <Card className="overflow-hidden transition-transform hover:scale-[1.02]">
            <div className="relative aspect-square">
              {profile.avatar_media ? (
                <CldImage
                  src={profile.avatar_media.public_id}
                  alt={profile.avatar_media.alt_text || profile.full_name || 'Avatar'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-muted">
                  <p className="text-2xl font-bold text-muted-foreground">
                    {profile.full_name?.charAt(0) || '?'}
                  </p>
                </div>
              )}
            </div>

            {/* Quick links overlay */}
            {(profile.github_username || profile.twitter_username || profile.website) && (
              <div className="space-y-2 p-4">
                {profile.github_username && (
                  <a
                    href={`https://github.com/${profile.github_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Badge variant="secondary">GitHub</Badge>
                    <span>@{profile.github_username}</span>
                  </a>
                )}
                {profile.twitter_username && (
                  <a
                    href={`https://twitter.com/${profile.twitter_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Badge variant="secondary">Twitter</Badge>
                    <span>@{profile.twitter_username}</span>
                  </a>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Badge variant="secondary">Website</Badge>
                    <span className="truncate">{profile.website}</span>
                  </a>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Bio text - Larger column */}
        <div className="md:col-span-8 space-y-6">
          {/* Name */}
          {profile.full_name && (
            <h2 className="text-4xl font-bold">{profile.full_name}</h2>
          )}

          {/* Bio from profile or MDX content */}
          {profile.bio && (
            <p className="text-xl leading-relaxed text-muted-foreground">
              {profile.bio}
            </p>
          )}

          {/* MDX content (nếu có) */}
          {content && (
            <div
              className="prose prose-gray dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}

          {/* Info cards grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard
              icon={MapPin}
              label={t('location')}
              value="Vietnam" // Có thể thêm vào database nếu cần
            />
            <InfoCard
              icon={Briefcase}
              label={t('role')}
              value="Full-stack Developer" // Có thể thêm vào database
            />
            <InfoCard
              icon={Mail}
              label={t('email')}
              value={profile.email}
            />
            <InfoCard
              icon={Calendar}
              label={t('experience')}
              value={yearsOfExperience > 0 ? `${yearsOfExperience}+ năm` : 'Mới bắt đầu'}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
