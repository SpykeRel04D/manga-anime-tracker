'use client'

import { Star } from 'lucide-react'
import type { ReactElement } from 'react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number | null
  onChange: (value: number | null) => void
  disabled?: boolean
}

export function StarRating({
  value,
  onChange,
  disabled = false,
}: StarRatingProps): ReactElement {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 10 }, (_, i) => i + 1).map(star => {
        const isFilled = hovered !== null ? star <= hovered : value !== null && star <= value
        const isHoverPreview = hovered !== null && star <= hovered

        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onChange(value === star ? null : star)}
            className="rounded p-0.5 transition-transform hover:scale-110 disabled:pointer-events-none disabled:opacity-50"
          >
            <Star
              className={cn(
                'size-5 transition-colors',
                isFilled
                  ? isHoverPreview
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-amber-500 text-amber-500'
                  : 'fill-transparent text-muted-foreground/40',
              )}
            />
          </button>
        )
      })}
      {value !== null && (
        <span className="ml-2 text-sm text-muted-foreground">{value}/10</span>
      )}
    </div>
  )
}
