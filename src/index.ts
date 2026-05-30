import { Hono } from 'hono'
import shareRoute from './routes/share'
import publicRoute from './routes/public'
import noteRoute from './routes/note'
import assetRoute from './routes/asset'

type Bindings = {
  R2: R2Bucket
  API_TOKEN: string
  ORG_DOMAIN: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', (c) => c.text('obsidian-org-share-worker: ok'))
app.route('/', shareRoute)
app.route('/', publicRoute)
app.route('/', noteRoute)
app.route('/', assetRoute)

export default app
