import { Hono } from 'hono'
import shareRoute from './routes/share'

type Bindings = {
  R2: R2Bucket
  API_TOKEN: string
  ORG_DOMAIN: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', (c) => c.text('obsidian-org-share-worker: ok'))
app.route('/', shareRoute)

export default app
