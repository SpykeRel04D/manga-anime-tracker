'use client'

import { Minus, Plus } from 'lucide-react'
import type { ReactElement } from 'react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ProgressStepperProps {
  value: number
  total: number | null
  label: 'eps' | 'ch'
  onChange: (value: number) => void
  disabled?: boolean
}

export function ProgressStepper({
  value,
  total,
  label,
  onChange,
  disabled = false,
}: ProgressStepperProps): ReactElement {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(String(value))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  function clamp(n: number): number {
    return Math.max(0, Math.min(n, total ?? Infinity))
  }

  function handleDecrement(): void {
    onChange(clamp(value - 1))
  }

  function handleIncrement(): void {
    onChange(clamp(value + 1))
  }

  function handleStartEdit(): void {
    setEditValue(String(value))
    setIsEditing(true)
  }

  function handleCommitEdit(): void {
    const parsed = parseInt(editValue, 10)
    if (!isNaN(parsed)) {
      onChange(clamp(parsed))
    }
    setIsEditing(false)
  }

  function handleKeyDown(e: React.KeyboardEvent): void {
    if (e.key === 'Enter') {
      handleCommitEdit()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
    }
  }

  const totalDisplay = total !== null ? total : '?'

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={handleDecrement}
        disabled={disabled || value <= 0}
      >
        <Minus className="size-3.5" />
      </Button>

      {isEditing ? (
        <Input
          ref={inputRef}
          type="number"
          min={0}
          max={total ?? undefined}
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={handleCommitEdit}
          onKeyDown={handleKeyDown}
          className="h-7 w-16 text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      ) : (
        <button
          type="button"
          onClick={handleStartEdit}
          disabled={disabled}
          className="text-foreground hover:bg-muted rounded px-2 py-0.5 text-sm font-medium tabular-nums transition-colors disabled:pointer-events-none disabled:opacity-50"
        >
          {value} / {totalDisplay} {label}
        </button>
      )}

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={handleIncrement}
        disabled={disabled || (total !== null && value >= total)}
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  )
}
