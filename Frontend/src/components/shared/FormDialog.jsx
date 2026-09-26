import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const SIZE_CLASS = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-3xl',
  '2xl': 'sm:max-w-4xl',
}

/**
 * Consistent create/edit modal: sticky title + footer, scrollable body.
 */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex max-h-[min(90vh,720px)] w-[calc(100%-2rem)] min-w-0 flex-col gap-0 overflow-hidden p-0',
          SIZE_CLASS[size] || SIZE_CLASS.md,
          className,
        )}
      >
        <DialogHeader className="shrink-0 space-y-1 border-b px-6 py-4 pr-12 text-left">
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-6 py-5">
          <div className="grid w-full min-w-0 max-w-full gap-6">{children}</div>
        </div>
        {footer ? (
          <DialogFooter className="shrink-0 border-t bg-muted/30 px-6 py-4 sm:justify-end">
            {footer}
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

/** Visual group inside a form dialog */
export function FormSection({ title, description, children, className }) {
  return (
    <section className={cn('min-w-0 space-y-3', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title ? <h3 className="text-sm font-semibold tracking-tight">{title}</h3> : null}
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      )}
      <div className="grid min-w-0 gap-4">{children}</div>
    </section>
  )
}
