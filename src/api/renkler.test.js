// Sunucu, kişilere brief §10'daki KOYU paletten renk atar. Açık temada
// bu renkler tokens.css'teki uyarlanmış karşılıklarına eşlenir; böylece
// "renk kişiyi takip eder" kuralı bozulmadan açık zeminde okunur kalır.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { sunucuRengi, ACIK_PALET } from './renkler.js'

test('brief koyu paleti açık palete birebir eşlenir', () => {
  assert.equal(sunucuRengi('#3987e5'), ACIK_PALET.mavi)
  assert.equal(sunucuRengi('#d95926'), ACIK_PALET.turuncu)
  assert.equal(sunucuRengi('#c98500'), ACIK_PALET.hardal)
  assert.equal(sunucuRengi('#d55181'), ACIK_PALET.pembe)
  assert.equal(sunucuRengi('#9085e9'), ACIK_PALET.mor)
  assert.equal(sunucuRengi('#e66767'), ACIK_PALET.mercan)
  assert.equal(sunucuRengi('#898781'), ACIK_PALET.gri)
})

test('sunucudan #199e70 gelirse petrole eşlenir (yeşil "birlikte"ye ayrılmış)', () => {
  assert.equal(sunucuRengi('#199e70'), ACIK_PALET.petrol)
  assert.notEqual(ACIK_PALET.petrol, '#199e70')
})

test('büyük harfli hex de eşlenir', () => {
  assert.equal(sunucuRengi('#3987E5'), ACIK_PALET.mavi)
})

test('bilinmeyen renk olduğu gibi geçer (kişiye özel renk)', () => {
  assert.equal(sunucuRengi('#123456'), '#123456')
})

test('açık palet tokens.css ile birebir aynı (kayma kilidi)', () => {
  const css = readFileSync(fileURLToPath(new URL('../theme/tokens.css', import.meta.url)), 'utf8')
  const cssRenkleri = {}
  for (const [, ad, deger] of css.matchAll(/--kisi-([a-z]+)\s*:\s*(#[0-9a-f]{6})/g)) {
    cssRenkleri[ad] = deger
  }
  assert.deepEqual({ ...ACIK_PALET }, cssRenkleri)
})
