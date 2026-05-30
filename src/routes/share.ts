import { Hono } from 'hono'
import { apiTokenMiddleware } from '../auth/apiToken'
import { putMeta, putHtml, getMeta, deleteNote } from '../r2'
import type { NoteMeta, ShareRequest, ShareResponse } from '../types'

const route = new Hono<{ Bindings: { R2: R2Bucket; API_TOKEN: string } }>()

function generateUuid(): string {
  // nanoid-style 12-char URL-safe
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'
  const arr = new Uint8Array(12)
  crypto.getRandomValues(arr)
  return Array.from(arr).map((b) => chars[b % chars.length]).join('')
}

route.use('/api/*', apiTokenMiddleware)

route.post('/api/share', async (c) => {
  const body = (await c.req.json()) as ShareRequest
  const now = new Date().toISOString()
  let uuid = body.uuid
  let created_at = now

  if (uuid) {
    const existing = await getMeta(c.env.R2, uuid)
    if (existing) created_at = existing.created_at
  } else {
    uuid = generateUuid()
  }

  const meta: NoteMeta = {
    uuid,
    mode: body.mode,
    audience: body.audience || [],
    expires_at: body.expires_at || null,
    created_at,
    updated_at: now,
    title: body.title,
    source_path: body.source_path,
    owner_email: body.owner_email,
  }

  await putMeta(c.env.R2, uuid, meta)
  await putHtml(c.env.R2, uuid, body.html)

  const host = new URL(c.req.url).origin
  const path = body.mode === 'public' ? `/p/${uuid}` : `/n/${uuid}`
  const url = `${host}${path}`

  return c.json({ uuid, url } satisfies ShareResponse)
})

route.delete('/api/share/:uuid', async (c) => {
  const uuid = c.req.param('uuid')
  await deleteNote(c.env.R2, uuid)
  return c.body(null, 204)
})

export default route
