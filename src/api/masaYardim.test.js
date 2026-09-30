// Karşılama masası saf yardımcıları — kayıtlı kişi araması + form geçerliliği.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { katilimciAra, formGecerli } from './masaYardim.js'

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
