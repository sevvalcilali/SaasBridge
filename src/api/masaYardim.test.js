// Karşılama masası saf yardımcıları — kayıtlı kişi araması + form geçerliliği.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { katilimciAra, formGecerli, acikKartlar, kartOner } from './masaYardim.js'

const LISTE = [
  { kisiId: 'k1', ad: 'Ayşe Demir', kurum: 'Atlas Ventures', rol: 'investor' },
  { kisiId: 'k2', ad: 'Cem Erdem', kurum: 'Nova Robotik', rol: 'founder' },
  { kisiId: 'k3', ad: 'İrem Korkmaz', kurum: 'Peak Enerji', rol: 'founder' },
]
const idler = (l) => l.map((k) => k.kisiId)

test('katilimciAra: boş arama → hepsi', () => {
  assert.equal(katilimciAra(LISTE, '').length, 3)
  assert.equal(katilimciAra(LISTE, '   ').length, 3)
})

test('katilimciAra: ad ve kurumda, Türkçe duyarsız', () => {
  assert.deepEqual(idler(katilimciAra(LISTE, 'nova')), ['k2'])
  assert.deepEqual(idler(katilimciAra(LISTE, 'AYŞE')), ['k1'])
  assert.deepEqual(idler(katilimciAra(LISTE, 'irem')), ['k3'])
})

test('formGecerli: ad zorunlu, rol geçerli olmalı', () => {
  assert.equal(formGecerli({ ad: 'Yeni Kişi', rol: 'founder' }), true)
  assert.equal(formGecerli({ ad: '', rol: 'founder' }), false)
  assert.equal(formGecerli({ ad: '   ', rol: 'founder' }), false)
  assert.equal(formGecerli({ ad: 'X', rol: 'gecersiz' }), false)
  assert.equal(formGecerli({ ad: 'X' }), false)
})

const KARTLAR = [
  { kart: '10', rssiAlici: -75, seenAgo: 0.5, atanan: 'k1', pil: 90 },
  { kart: '11', rssiAlici: -50, seenAgo: 1.0, atanan: null, pil: 80 },
  { kart: '12', rssiAlici: -80, seenAgo: 40, atanan: null, pil: 60 },  // bayat (duyulmuyor)
  { kart: '113', rssiAlici: -70, seenAgo: 0.2, atanan: null, pil: 70 },
]

test('acikKartlar: yalnız yakın zamanda duyulanlar, güce göre azalan', () => {
  const a = acikKartlar(KARTLAR)
  assert.deepEqual(a.map((k) => k.kart), ['11', '113', '10'])   // 12 bayat, elendi
})

test('kartOner: numara ön ekine göre süzer; boşta hepsi', () => {
  assert.deepEqual(kartOner(KARTLAR, '').map((k) => k.kart), ['10', '11', '12', '113'])
  assert.deepEqual(kartOner(KARTLAR, '1').map((k) => k.kart), ['10', '11', '12', '113'])
  assert.deepEqual(kartOner(KARTLAR, '11').map((k) => k.kart), ['11', '113'])
  assert.deepEqual(kartOner(KARTLAR, '113').map((k) => k.kart), ['113'])
})
