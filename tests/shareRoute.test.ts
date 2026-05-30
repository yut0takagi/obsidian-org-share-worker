import { describe, it, expect, beforeEach } from 'vitest'
import { Hono } from 'hono'
import shareRoute from '../src/routes/share'

class MockR2 implements Partial<R2Bucket> {
  store = new Map<string, string>()
  async put(key: string, value: any) {
    const text = typeof value === 'string' ? value : new TextDecoder().decode(await new Response(value).arrayBuffer())
    this.store.set(key, text)
    return {} as any
  }
  async get(key: string) {
    const v = this.store.get(key)
    if (!v) return null
    return { text: async () => v, arrayBuffer: async () => new TextEncoder().encode(v).buffer, httpMetadata: {} } as any
  }
  async delete(keys: string[] | string) {
    const arr = Array.isArray(keys) ? keys : [keys]
    arr.forEach((k) => this.store.delete(k))
  }
}

describe('POST /api/share', () => {
  let app: Hono<any>
  let env: any

  beforeEach(() => {
    env = { R2: new MockR2(), API_TOKEN: 'tok', ORG_DOMAIN: 'cyberagent.co.jp' }
    app = new Hono()
    app.route('/', shareRoute)
  })

  it('creates a new share with generated uuid when uuid is null', async () => {
    const body = {
      uuid: null,
      mode: 'public',
      title: 'Hello',
      source_path: 'notes/a.md',
      html: '<p>hi</p>',
      owner_email: 'me@x.com',
    }
    const res = await app.request('/api/share', {
      method: 'POST',
      headers: { Authorization: 'Bearer tok', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }, env)
    expect(res.status).toBe(200)
    const json = await res.json() as any
    expect(json.uuid).toMatch(/^[A-Za-z0-9_-]{8,}$/)
    expect(json.url).toContain(json.uuid)
  })

  it('updates existing share when uuid is provided', async () => {
    const env2: any = { R2: new MockR2(), API_TOKEN: 'tok', ORG_DOMAIN: 'cyberagent.co.jp' }
    // Pre-populate
    await env2.R2.put('notes/abc123.json', JSON.stringify({ uuid: 'abc123', mode: 'public', audience: [], created_at: '2026-05-30T00:00:00Z', updated_at: '2026-05-30T00:00:00Z', title: 'Old', source_path: 'x.md', owner_email: 'me@x.com', expires_at: null }))
    await env2.R2.put('notes/abc123.html', '<p>old</p>')

    const body = {
      uuid: 'abc123',
      mode: 'public',
      title: 'Updated',
      source_path: 'x.md',
      html: '<p>new</p>',
      owner_email: 'me@x.com',
    }
    const res = await app.request('/api/share', {
      method: 'POST',
      headers: { Authorization: 'Bearer tok', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }, env2)
    expect(res.status).toBe(200)
    const json = await res.json() as any
    expect(json.uuid).toBe('abc123')
  })
})
