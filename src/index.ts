import { Hono } from 'hono'

type Bindings = {
  R2: R2Bucket
  API_TOKEN: string
  ORG_DOMAIN: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', (c) => c.text('obsidian-org-share-worker: ok'))

export default app
