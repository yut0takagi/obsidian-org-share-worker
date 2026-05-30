# obsidian-org-share-worker

Cloudflare Worker backend for the [Org Share](https://github.com/yut0takagi/obsidian-org-share) Obsidian plugin. Receives note HTML + metadata + image assets from the plugin via authenticated HTTP, stores them in R2, serves notes at `/n/:uuid` (CF Access-gated) or `/p/:uuid` (public).

## Setup

```bash
# 1. Install deps
npm install

# 2. Authenticate wrangler (browser login OR API token)
npx wrangler login
# or:
export CLOUDFLARE_API_TOKEN='<api-token-with-Workers+R2+Account:Read>'

# 3. Create the R2 bucket (one-time)
npx wrangler r2 bucket create org-share-takagi

# 4. Set the bearer secret used by the plugin
TOKEN=$(openssl rand -hex 32)
echo "Save this — you'll paste it into the plugin settings:"
echo "$TOKEN"
echo "$TOKEN" | npx wrangler secret put API_TOKEN

# 5. (Optional, after CF Access app is configured) set the JWT validation env
echo "<team>.cloudflareaccess.com" | npx wrangler secret put CF_ACCESS_TEAM_DOMAIN
echo "<aud-tag>" | npx wrangler secret put CF_ACCESS_AUD

# 6. Deploy
npx wrangler deploy
```

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/share` | Bearer | Create or update a shared note. Body: `ShareRequest`. Returns `{uuid, url}`. |
| DELETE | `/api/share/:uuid` | Bearer | Un-publish a note (deletes meta + html from R2). |
| POST | `/api/asset?hash=&ext=` | Bearer | Upload an image binary. |
| GET | `/n/:uuid` | CF Access | Reader endpoint for Org and Allowlist modes. JWT verified + audience checked. |
| GET | `/p/:uuid` | none | Public reader endpoint. |
| GET | `/a/:filename` | none | Asset serving (cacheable). |

## Cloudflare Access setup

For `/n/:uuid` mode-gated reads:

1. Cloudflare dashboard → Zero Trust → activate (free, 50 users).
2. Settings → Authentication → add Google + One-time PIN identity providers.
3. Access → Applications → Add → Self-hosted:
   - Application domain: `obsidian-org-share-worker.<sub>.workers.dev`
   - Path: `/n/*`
   - Policy: "Any signed-in user" (per-note audience filtering is done in the Worker).
4. Copy the Application AUD and team domain to the Worker secrets above.

## Tests

```bash
npx vitest run
```

19 tests covering: bearer middleware, share/delete routes, public/private serving, JWT verification (malformed), audience check (org/list/public modes).

## License

MIT
