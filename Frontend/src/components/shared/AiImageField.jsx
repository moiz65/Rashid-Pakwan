import { useState } from 'react'
import { toast } from 'sonner'
import { Sparkles, Upload } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAppSelector } from '@/store/hooks'
import { selectAuth } from '@/store/selectors'
import { generateCatalogImageRequest, resolveMediaUrl, uploadCatalogImage } from '@/lib/api'

/**
 * Shared image upload + OpenAI generate controls for catalog forms.
 */
export function AiImageField({
  label = 'Image',
  value,
  onChange,
  title,
  description,
  kind = 'product',
}) {
  const { token } = useAppSelector(selectAuth)
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)

  const previewSrc = resolveMediaUrl(value)

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !token) return
    setUploading(true)
    try {
      const url = await uploadCatalogImage(token, file)
      onChange?.(url)
      toast.success('Image uploaded')
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleGenerate = async () => {
    if (!token) return
    if (!String(title || '').trim()) {
      toast.error('Enter a title/name first so AI can generate the image')
      return
    }
    setGenerating(true)
    try {
      const { url } = await generateCatalogImageRequest(token, {
        title: String(title).trim(),
        description: String(description || '').trim(),
        kind,
      })
      onChange?.(url)
      toast.success('AI image generated')
    } catch (err) {
      toast.error(err.message || 'Failed to generate image')
    } finally {
      setGenerating(false)
    }
  }

  const busy = uploading || generating
  const inputId = `ai-image-${kind}-${label.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="flex items-start gap-3">
        {previewSrc ? (
          <img src={previewSrc} alt="" className="h-16 w-16 rounded object-cover border shrink-0" />
        ) : (
          <div className="h-16 w-16 rounded border flex items-center justify-center text-muted-foreground text-xs shrink-0">
            No image
          </div>
        )}
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex flex-wrap gap-2">
            <Label htmlFor={inputId} className="cursor-pointer">
              <span className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
                <Upload className="h-4 w-4" />
                {uploading ? 'Uploading…' : 'Upload'}
              </span>
            </Label>
            <Input
              id={inputId}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={busy}
              onChange={handleUpload}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9"
              disabled={busy}
              onClick={handleGenerate}
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              {generating ? 'Generating…' : 'Generate with AI'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            AI uses the title and description to create a menu-style photo.
          </p>
        </div>
      </div>
    </div>
  )
}
