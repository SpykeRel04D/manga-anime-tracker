'use client'

import { Loader2, RefreshCw, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { ReactElement } from 'react'
import { useEffect, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { TrackingEntry } from '@/modules/tracking/domain/entities/tracking-entry'

import {
  changeNotes,
  changeProgress,
  changeRating,
  changeStatus,
  refreshEntryMetadata,
  removeFromList,
} from './actions'
import { ProgressStepper } from './progress-stepper'
import { StarRating } from './star-rating'

const STATUS_OPTIONS = [
  { label: 'Watching', value: 'watching' },
  { label: 'Completed', value: 'completed' },
  { label: 'On Hold', value: 'on_hold' },
  { label: 'Dropped', value: 'dropped' },
  { label: 'Plan to Watch', value: 'plan_to_watch' },
] as const

type TrackingStatus = TrackingEntry['status']

interface TrackingEditFormProps {
  entry: TrackingEntry
}

export function TrackingEditForm({ entry }: TrackingEditFormProps): ReactElement {
  const router = useRouter()

  // Local state for optimistic updates
  const [status, setStatus] = useState<TrackingStatus>(entry.status)
  const [progress, setProgress] = useState(entry.progress)
  const [rating, setRating] = useState<number | null>(entry.rating)
  const [notes, setNotes] = useState(entry.notes ?? '')
  const initialNotesRef = useRef(entry.notes ?? '')

  // Independent transitions for each field
  const [isStatusPending, startStatusTransition] = useTransition()
  const [isProgressPending, startProgressTransition] = useTransition()
  const [isRatingPending, startRatingTransition] = useTransition()
  const [isNotesPending, startNotesTransition] = useTransition()
  const [isRemovePending, startRemoveTransition] = useTransition()
  const [isRefreshPending, startRefreshTransition] = useTransition()

  // Metadata refresh on mount
  useEffect(() => {
    startRefreshTransition(async () => {
      const result = await refreshEntryMetadata(entry.id)
      if (result.success && 'refreshed' in result && result.refreshed) {
        router.refresh()
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.id])

  const title = entry.titleEnglish ?? entry.titleRomaji ?? 'Unknown Title'
  const showRomajiSubtitle =
    entry.titleEnglish !== null &&
    entry.titleRomaji !== null &&
    entry.titleEnglish !== entry.titleRomaji

  const progressTotal =
    entry.mediaType === 'anime' ? entry.totalEpisodes : entry.totalChapters
  const progressLabel = entry.mediaType === 'anime' ? 'eps' : 'ch'

  function handleStatusChange(newStatus: TrackingStatus): void {
    const previousStatus = status
    setStatus(newStatus)
    startStatusTransition(async () => {
      const result = await changeStatus(entry.id, newStatus)
      if (result.success) {
        toast.success('Status updated')
      } else {
        toast.error('Failed to update status')
        setStatus(previousStatus)
      }
    })
  }

  function handleProgressChange(newProgress: number): void {
    const previousProgress = progress
    const previousStatus = status
    setProgress(newProgress)
    startProgressTransition(async () => {
      const result = await changeProgress(entry.id, newProgress)
      if (result.success) {
        if ('statusChanged' in result && result.statusChanged) {
          setStatus('completed')
          toast.success('Marked as Completed!')
        } else {
          toast.success('Progress updated')
        }
      } else {
        toast.error('Failed to update progress')
        setProgress(previousProgress)
        setStatus(previousStatus)
      }
    })
  }

  function handleRatingChange(newRating: number | null): void {
    const previousRating = rating
    setRating(newRating)
    startRatingTransition(async () => {
      const result = await changeRating(entry.id, newRating)
      if (result.success) {
        toast.success(newRating !== null ? 'Rating updated' : 'Rating removed')
      } else {
        toast.error('Failed to update rating')
        setRating(previousRating)
      }
    })
  }

  function handleNotesBlur(): void {
    const trimmed = notes.trim()
    const notesValue = trimmed === '' ? null : trimmed
    const initialValue = initialNotesRef.current.trim() === '' ? null : initialNotesRef.current.trim()

    if (notesValue === initialValue) return

    startNotesTransition(async () => {
      const result = await changeNotes(entry.id, notesValue)
      if (result.success) {
        initialNotesRef.current = notes
        toast.success('Notes saved')
      } else {
        toast.error('Failed to save notes')
      }
    })
  }

  function handleRemove(): void {
    startRemoveTransition(async () => {
      const result = await removeFromList(entry.id)
      if (result.success) {
        toast.success('Removed from your list')
        router.push('/search')
      } else {
        toast.error('Failed to remove entry')
      }
    })
  }

  function handleManualRefresh(): void {
    startRefreshTransition(async () => {
      const result = await refreshEntryMetadata(entry.id, true)
      if (result.success) {
        if ('refreshed' in result && result.refreshed) {
          toast.success('Metadata refreshed')
          router.refresh()
        } else {
          toast.info('Metadata is up to date')
        }
      } else {
        toast.error('Failed to refresh metadata')
      }
    })
  }

  function handleTextareaInput(e: React.FormEvent<HTMLTextAreaElement>): void {
    const target = e.currentTarget
    target.style.height = 'auto'
    target.style.height = `${target.scrollHeight}px`
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header: Cover image + titles */}
      <div className="flex gap-4">
        <div className="relative h-[180px] w-[128px] shrink-0 overflow-hidden rounded-lg">
          {entry.coverImageUrl ? (
            <Image
              src={entry.coverImageUrl}
              alt={title}
              width={128}
              height={180}
              className="h-full w-full object-cover"
              priority
            />
          ) : (
            <div className="from-muted to-muted/60 flex h-full w-full items-center justify-center bg-gradient-to-br">
              <span className="text-muted-foreground text-xs">No image</span>
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="text-foreground text-xl font-bold leading-tight">{title}</h1>
          {showRomajiSubtitle && (
            <p className="text-muted-foreground text-sm">{entry.titleRomaji}</p>
          )}
          <p className="text-muted-foreground mt-1 text-xs capitalize">
            {entry.mediaType}
          </p>
          <div className="mt-auto">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleManualRefresh}
              disabled={isRefreshPending}
            >
              <RefreshCw
                className={cn('size-3.5', isRefreshPending && 'animate-spin')}
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Status dropdown */}
      <div className="flex flex-col gap-1.5">
        <label className="text-muted-foreground text-xs font-medium">Status</label>
        <Select
          value={status}
          onValueChange={v => handleStatusChange(v as TrackingStatus)}
          disabled={isStatusPending}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status">
              {STATUS_OPTIONS.find(o => o.value === status)?.label ?? 'Status'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {STATUS_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Progress stepper */}
      <div className="flex flex-col gap-1.5">
        <label className="text-muted-foreground text-xs font-medium">Progress</label>
        <ProgressStepper
          value={progress}
          total={progressTotal}
          label={progressLabel}
          onChange={handleProgressChange}
          disabled={isProgressPending}
        />
      </div>

      {/* Star rating */}
      <div className="flex flex-col gap-1.5">
        <label className="text-muted-foreground text-xs font-medium">Rating</label>
        <StarRating
          value={rating}
          onChange={handleRatingChange}
          disabled={isRatingPending}
        />
      </div>

      {/* Notes textarea */}
      <div className="flex flex-col gap-1.5">
        <label className="text-muted-foreground text-xs font-medium">Notes</label>
        <Textarea
          placeholder="Add personal notes..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          onBlur={handleNotesBlur}
          onInput={handleTextareaInput}
          disabled={isNotesPending}
          className="min-h-[80px] resize-none"
        />
      </div>

      {/* Remove button */}
      <div className="border-border border-t pt-4">
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button variant="destructive" disabled={isRemovePending}>
                {isRemovePending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                Remove from list
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove from your list?</AlertDialogTitle>
              <AlertDialogDescription>
                Remove &ldquo;{title}&rdquo; from your list? This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={handleRemove}>
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

