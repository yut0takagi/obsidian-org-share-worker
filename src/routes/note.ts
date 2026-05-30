import { Hono } from 'hono'
import { getMeta, getHtml } from '../r2'

const route = new Hono<{ Bindings: { R2: R2Bucket; ORG_DOMAIN: string } }>()

route.get('/n/:uuid', async (c) => {
  const uuid = c.req.param('uuid')
  const meta = await getMeta(c.env.R2, uuid)
  if (!meta) return c.text('Not Found', 404)
  if (meta.mode === 'public') return c.text('Use /p/:uuid for public notes', 400)
  if (meta.expires_at && new Date(meta.expires_at) < new Date()) {
    return c.text('Link Expired', 410)
  }

  // CF Access JWT verification will be added in Task D2.
  // For now, require the header to exist.
  const jwt = c.req.header('Cf-Access-Jwt-Assertion')
  if (!jwt) return c.text('Unauthorized', 401)

  // TODO Task D2: verify JWT, check email vs mode/audience.
  // For now, just serve HTML.
  const html = await getHtml(c.env.R2, uuid)
  if (!html) return c.text('Not Found', 404)
  return c.html(html)
})

export default route
