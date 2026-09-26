import fs from 'fs'
import path from 'path'
import OpenAI from 'openai'
import config from '../config/index.js'
import { UPLOADS_DIR, saveBufferLocally } from '../middleware/upload.js'
import { isCloudinaryConfigured, uploadImageBuffer } from './cloudinary.service.js'
import { ApiError } from '../utils/response.js'

function getClient() {
  if (!config.openaiApiKey) {
    throw new ApiError(503, 'OPENAI_API_KEY is not configured on the server')
  }
  return new OpenAI({
    apiKey: config.openaiApiKey,
    maxRetries: 4,
  })
}

function buildPrompt({ title, description, kind = 'product' }) {
  const name = String(title || '').trim()
  if (!name) throw new ApiError(400, 'Title is required to generate an image')

  const details = String(description || '').trim()
  const kindLabel =
    kind === 'deal'
      ? 'restaurant combo meal deal'
      : kind === 'drink'
        ? 'restaurant beverage'
        : kind === 'addon'
          ? 'restaurant food add-on or side'
          : 'restaurant food dish'

  return [
    `Professional appetizing food photography of a ${kindLabel} named "${name}".`,
    details ? `Details: ${details}.` : '',
    'Shot for a modern restaurant menu: realistic plating, natural lighting, shallow depth of field, high detail.',
    'No text, no logos, no watermarks, no price tags, no hands unless needed for plating.',
    'Square composition suitable for a menu card thumbnail.',
  ]
    .filter(Boolean)
    .join(' ')
}

function mapOpenAiError(err) {
  const status = err?.status
  const code = err?.code || err?.error?.code
  const type = err?.type || err?.error?.type
  const raw = String(err?.message || err?.error?.message || 'OpenAI image generation failed')
  const requestId = err?.request_id || err?.headers?.get?.('x-request-id') || null

  if (status === 401 || status === 403) {
    return new ApiError(502, 'OpenAI rejected the API key. Check OPENAI_API_KEY and project permissions.')
  }
  if (
    status === 429 ||
    code === 'rate_limit_exceeded' ||
    /rate limit|too many concurrent|upstream connect|connection termination/i.test(raw)
  ) {
    return new ApiError(
      429,
      'OpenAI is rate-limiting or blocking this project (too many concurrent requests). Check billing, usage limits, and create a fresh API key in platform.openai.com, then retry.'
    )
  }
  if (status === 400) {
    return new ApiError(400, raw.replace(/^\d+\s*/, ''))
  }
  if (status >= 500 || type === 'server_error') {
    const suffix = requestId ? ` (request ${requestId})` : ''
    return new ApiError(
      502,
      `OpenAI image service failed on their side. Confirm the project has image access + billing credits, then retry.${suffix}`
    )
  }

  return new ApiError(502, raw.replace(/^\d+\s*/, ''))
}

async function savePngBuffer(buffer) {
  if (isCloudinaryConfigured()) {
    return uploadImageBuffer(buffer, {
      folder: 'restaurant-admin/ai',
      publicId: `ai_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    })
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true })
  }
  return saveBufferLocally(buffer, '.png')
}

async function saveFromOpenAiResult(item) {
  if (item?.b64_json) {
    return savePngBuffer(Buffer.from(item.b64_json, 'base64'))
  }
  if (item?.url) {
    const res = await fetch(item.url)
    if (!res.ok) throw new ApiError(502, 'Failed to download generated image from OpenAI')
    const arrayBuffer = await res.arrayBuffer()
    return savePngBuffer(Buffer.from(arrayBuffer))
  }
  throw new ApiError(502, 'OpenAI returned no image data')
}

export async function generateCatalogImage({ title, description, kind }) {
  const client = getClient()
  const prompt = buildPrompt({ title, description, kind })
  const model = config.openaiImageModel || 'gpt-image-1'

  let result
  try {
    result = await client.images.generate({
      model,
      prompt,
      n: 1,
      size: '1024x1024',
    })
  } catch (err) {
    console.error('[aiImage]', err?.status, err?.message)
    throw mapOpenAiError(err)
  }

  const url = await saveFromOpenAiResult(result?.data?.[0])

  return {
    url,
    prompt,
    model,
  }
}
