import { BookOpen, Cpu, Globe2, HeartHandshake, Palette, Rocket, Trophy } from 'lucide-react'
import type { ComponentType } from 'react'

import { cn } from '@common/helpers/cn'
import type { ClubCategory, ClubListItem } from '../shared/types'
import { formatClubCategory, getClubInitials } from '../shared/helpers'

type ClubVisualTone = {
  Icon: ComponentType<{ size?: number; className?: string }>
  className: string
}

const categoryVisuals: Record<ClubCategory, ClubVisualTone> = {
  academic: {
    Icon: BookOpen,
    className: 'bg-blue-50 text-accent-blue'
  },
  arts: {
    Icon: Palette,
    className: 'bg-violet-50 text-accent-violet'
  },
  community_service: {
    Icon: HeartHandshake,
    className: 'bg-green-50 text-accent-green'
  },
  culture: {
    Icon: Globe2,
    className: 'bg-amber-50 text-accent-amber'
  },
  entrepreneurship: {
    Icon: Rocket,
    className: 'bg-primary-soft text-primary'
  },
  sports: {
    Icon: Trophy,
    className: 'bg-red-50 text-accent-red'
  },
  technology: {
    Icon: Cpu,
    className: 'bg-blue-50 text-accent-blue'
  }
}

type ClubVisualProps = {
  club: Pick<ClubListItem, 'category' | 'coverImageUrl' | 'logoUrl' | 'name'>
  className?: string
  variant?: 'card' | 'hero' | 'logo'
}

export default function ClubVisual({ club, className, variant = 'card' }: ClubVisualProps) {
  const visual = categoryVisuals[club.category]
  const imageUrl = variant === 'logo' ? club.logoUrl : club.coverImageUrl
  const Icon = visual.Icon

  if (imageUrl) {
    return (
      <img
        alt={`${club.name} visual`}
        className={cn('h-full w-full object-cover', className)}
        src={imageUrl}
      />
    )
  }

  return (
    <div className={cn('grid h-full w-full place-items-center', visual.className, className)}>
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-surface/80 shadow-sm">
          <Icon size={variant === 'hero' ? 34 : 28} aria-hidden="true" />
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.08em]">
          {formatClubCategory(club.category)}
        </span>
        {variant !== 'hero' ? (
          <span className="text-2xl font-bold text-current">{getClubInitials(club.name)}</span>
        ) : null}
      </div>
    </div>
  )
}
