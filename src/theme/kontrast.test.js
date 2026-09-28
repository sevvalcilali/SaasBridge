// tokens.css sözleşme testi: açık (krem) zeminde WCAG kontrast ve
// kişi paletinin ayırt edilebilirliği. Brief §10: koyu palet açık yüzey
// için yeniden doğrulanmalı; yeşil yalnız "birlikte" durumunun rengi.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const cssYolu = fileURLToPath(new URL('./tokens.css', import.meta.url))

function tokenlariOku() {
  const css = readFileSync(cssYolu, 'utf8')
  const tokenlar = {}
  for (const [, ad, deger] of css.matchAll(/--([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})/g)) {
    tokenlar[ad] = deger.toLowerCase()
  }
  return tokenlar
}

function rgb(hex) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
}

function luminans(hex) {
  const [r, g, b] = rgb(hex).map((k) =>
    k <= 0.04045 ? k / 12.92 : ((k + 0.055) / 1.055) ** 2.4,
  )
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function kontrast(a, b) {
  const [l1, l2] = [luminans(a), luminans(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

// CIE76 ΔE — kişi renklerinin birbirine çok benzemediğinin kaba ölçüsü
function lab(hex) {
  let [r, g, b] = rgb(hex).map((k) =>
    k <= 0.04045 ? k / 12.92 : ((k + 0.055) / 1.055) ** 2.4,
  )
  const [x, y, z] = [
    (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047,
    0.2126 * r + 0.7152 * g + 0.0722 * b,
    (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883,
  ].map((t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116))
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)]
}

function deltaE(a, b) {
  const [l1, a1, b1] = lab(a)
  const [l2, a2, b2] = lab(b)
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2)
}

const KISI_PALETI = ['kisi-mavi', 'kisi-turuncu', 'kisi-hardal', 'kisi-pembe', 'kisi-mor', 'kisi-mercan', 'kisi-gri']

test('temel token seti tanımlı', () => {
  const t = tokenlariOku()
  const gerekli = [
    'zemin', 'yuzey', 'yuzey-2', 'cizgi', 'metin', 'metin-2', 'vurgu',
    'birlikte', 'birlikte-zemin', 'olumlu', 'olumlu-zemin',
    'uyari', 'uyari-zemin', 'ciddi', 'ciddi-zemin', ...KISI_PALETI,
  ]
  for (const ad of gerekli) assert.ok(t[ad], `--${ad} eksik`)
})

test('yeşil paletten çıkarıldı: hiçbir kişi rengi "birlikte" yeşiline yakın değil', () => {
  const t = tokenlariOku()
  for (const ad of KISI_PALETI) {
    assert.ok(deltaE(t[ad], t['birlikte']) >= 30, `--${ad} birlikte-yeşiline çok yakın`)
  }
})

test('metin renkleri krem zeminde okunur (WCAG)', () => {
  const t = tokenlariOku()
  for (const yzy of ['zemin', 'yuzey', 'yuzey-2']) {
    assert.ok(kontrast(t.metin, t[yzy]) >= 7, `metin/${yzy}: ${kontrast(t.metin, t[yzy]).toFixed(2)} < 7`)
    assert.ok(kontrast(t['metin-2'], t[yzy]) >= 4.5, `metin-2/${yzy}: ${kontrast(t['metin-2'], t[yzy]).toFixed(2)} < 4.5`)
  }
})

test('durum renkleri kendi pastel zemininde ve yüzeyde okunur', () => {
  const t = tokenlariOku()
  for (const durum of ['birlikte', 'olumlu', 'uyari', 'ciddi']) {
    assert.ok(kontrast(t[durum], t[`${durum}-zemin`]) >= 4.5,
      `${durum} / ${durum}-zemin: ${kontrast(t[durum], t[`${durum}-zemin`]).toFixed(2)} < 4.5`)
    assert.ok(kontrast(t[durum], t.yuzey) >= 4.5,
      `${durum} / yuzey: ${kontrast(t[durum], t.yuzey).toFixed(2)} < 4.5`)
  }
})

test('kişi paleti açık zeminde görünür (≥3:1, metin dışı öge)', () => {
  const t = tokenlariOku()
  for (const ad of KISI_PALETI) {
    for (const yzy of ['zemin', 'yuzey']) {
      assert.ok(kontrast(t[ad], t[yzy]) >= 3,
        `--${ad}/${yzy}: ${kontrast(t[ad], t[yzy]).toFixed(2)} < 3`)
    }
  }
})

test('kişi renkleri birbirinden ayırt edilebilir (ΔE ≥ 20)', () => {
  const t = tokenlariOku()
  for (let i = 0; i < KISI_PALETI.length; i++) {
    for (let j = i + 1; j < KISI_PALETI.length; j++) {
      const d = deltaE(t[KISI_PALETI[i]], t[KISI_PALETI[j]])
      assert.ok(d >= 20, `${KISI_PALETI[i]} ↔ ${KISI_PALETI[j]}: ΔE ${d.toFixed(1)} < 20`)
    }
  }
})
