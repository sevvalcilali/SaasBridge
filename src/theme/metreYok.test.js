// Brief §1 (pazarlıksız): arayüzde hiçbir yerde metre/cm olmayacak — sinyal gücü
// mesafeye güvenilir biçimde çevrilemez. Ekran metinlerinde mesafe birimi aranır.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SRC = fileURLToPath(new URL('..', import.meta.url))
function dosyalar(dizin) {
  return readdirSync(dizin).flatMap((a) => {
    const yol = join(dizin, a)
    if (statSync(yol).isDirectory()) return dosyalar(yol)
    return /\.(jsx|js)$/.test(a) && !a.endsWith('.test.js') ? [yol] : []
  })
}

test('arayüz kaynağında metre/cm/mm yok', () => {
  const ihlal = []
  for (const yol of dosyalar(SRC)) {
    readFileSync(yol, 'utf8').split('\n').forEach((satir, i) => {
      if (/\d\s*[–-]?\s*\d*\s*(cm|mm|km)\b/i.test(satir) || /\bmetre/i.test(satir)) {
        ihlal.push(`${yol.replace(SRC, 'src/')}:${i + 1}: ${satir.trim()}`)
      }
    })
  }
  assert.deepEqual(ihlal, [])
})
