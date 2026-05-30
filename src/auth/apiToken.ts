import type { MiddlewareHandler } from 'hono'

type Env = { Bindings: { API_TOKEN: string } }

export const apiTokenMiddleware: MiddlewareHandler<Env> = async (c, next) => {
  const auth = c.req.header('Authorization')
  if (!auth || !auth.startsWith('Bearer ')) {
    return c.text('Unauthorized', 401)
  }
  const token = auth.slice('Bearer '.length).trim()
  if (token !== c.env.API_TOKEN) {
    return c.text('Unauthorized', 401)
  }
  await next()
}
