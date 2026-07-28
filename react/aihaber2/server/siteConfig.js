import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

/** .env dosyasını process.env'e yükler (dotenv paketi gerekmez) */
export function loadEnv() {
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
  const file = path.join(root, '.env')
  if (!fs.existsSync(file)) return
  const text = fs.readFileSync(file, 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = value
  }
}

loadEnv()

/** Site ayarları — domain/SSL sizde; e-postayı canlıda güncelleyin */
export const SITE = {
  name: 'AİORA',
  /** Canlıda https://alanadiniz.com yapın */
  url: process.env.SITE_URL || 'http://localhost:5180',
  contactEmail: process.env.CONTACT_EMAIL || 'merhaba@ornek-domain.com',
  copyrightEmail: process.env.COPYRIGHT_EMAIL || 'telif@ornek-domain.com',
  /** Editör paneli şifresi — .env içindeki EDITOR_KEY */
  editorKey: String(process.env.EDITOR_KEY || 'aiora-edit').trim(),
}
