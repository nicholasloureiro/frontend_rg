import fs from 'node:fs'
import path from 'node:path'

const BACKEND_URL = process.env.BACKEND_URL || 'https://backendrg-production.up.railway.app'

export function loadTokens() {
  const raw = fs.readFileSync(path.resolve('tests/e2e/.auth/tokens.json'), 'utf-8')
  return JSON.parse(raw)
}

export function authHeaders() {
  const { access } = loadTokens()
  return {
    Authorization: `Bearer ${access}`,
    'Content-Type': 'application/json',
  }
}

export function apiBase() {
  return BACKEND_URL
}

export function todayISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
