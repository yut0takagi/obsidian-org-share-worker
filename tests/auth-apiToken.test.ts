import { describe, it, expect } from 'vitest'
import { apiTokenMiddleware } from '../src/auth/apiToken'
import { Hono } from 'hono'

describe('apiTokenMiddleware', () => {
  const makeApp = (token: string) => {
    const app = new Hono<{ Bindings: { API_TOKEN: string } }>()
    app.use('/api/*', apiTokenMiddleware)
    app.get('/api/ping', (c) => c.text('pong'))
    return { app, env: { API_TOKEN: token } }
  }

  it('rejects when Authorization header missing', async () => {
    const { app, env } = makeApp('secret123')
    const res = await app.request('/api/ping', {}, env)
    expect(res.status).toBe(401)
  })

  it('rejects when token does not match', async () => {
    const { app, env } = makeApp('secret123')
    const res = await app.request('/api/ping', { headers: { Authorization: 'Bearer wrong' } }, env)
    expect(res.status).toBe(401)
  })

  it('passes when token matches', async () => {
    const { app, env } = makeApp('secret123')
    const res = await app.request('/api/ping', { headers: { Authorization: 'Bearer secret123' } }, env)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('pong')
  })
})
