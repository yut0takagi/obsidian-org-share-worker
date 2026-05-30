export type ShareMode = 'org' | 'list' | 'public'

export interface NoteMeta {
  uuid: string
  mode: ShareMode
  audience: string[]
  expires_at: string | null
  created_at: string
  updated_at: string
  title: string
  source_path: string
  owner_email: string
}

export interface ShareRequest {
  uuid: string | null
  mode: ShareMode
  audience?: string[]
  expires_at?: string | null
  title: string
  source_path: string
  html: string
  owner_email: string
}

export interface ShareResponse {
  uuid: string
  url: string
}
