import type { ShareMode } from '../types'

export function isAllowed(
  note: { mode: ShareMode; audience: string[] },
  email: string,
  orgDomain: string,
): boolean {
  if (note.mode === 'public') return true
  const e = email.toLowerCase()
  if (note.mode === 'org') {
    return e.endsWith(`@${orgDomain.toLowerCase()}`)
  }
  if (note.mode === 'list') {
    return note.audience.map((a) => a.toLowerCase()).includes(e)
  }
  return false
}
