// Durumdan türetilen küçük kararlar — JSX içinde hesap yok (temiz mimari).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { aliciBagli, durumCumlesi, gruplaRol, gorunenAd } from './durum.js'

test('aliciBagli: taze veri geliyorsa bağlı', () => {
  assert.equal(aliciBagli({ receiverAge: 0.1 }), true)
  assert.equal(aliciBagli({ receiverAge: 5 }), true)
})

test('aliciBagli: 5 sn üstü bayat → bağlı değil (brief §5.1: >5 sorun)', () => {
  assert.equal(aliciBagli({ receiverAge: 5.1 }), false)
  assert.equal(aliciBagli({ receiverAge: 40 }), false)
})

test('aliciBagli: hiç veri gelmediyse (null/undefined) bağlı değil', () => {
  assert.equal(aliciBagli({ receiverAge: null }), false)
  assert.equal(aliciBagli({ receiverAge: undefined }), false)
})

test('durumCumlesi: birlikte → "X ile · süre"', () => {
  assert.equal(
    durumCumlesi({ status: 'talking', withName: 'Nova Robotik', live: 3.34 }),
    'Nova Robotik ile · 3 dk 20 sn',
  )
})

test('durumCumlesi: birden fazla kişiyle birlikte', () => {
  assert.equal(
    durumCumlesi({ status: 'talking', withName: 'Ayşe, Mehmet', live: 0.5 }),
    'Ayşe, Mehmet ile · 30 sn',
  )
})

test('durumCumlesi: boşta', () => {
  assert.equal(durumCumlesi({ status: 'idle' }), 'boşta')
})

test('durumCumlesi: görünmüyor → seenAgo ile', () => {
  assert.equal(
    durumCumlesi({ status: 'away', seenAgo: 130 }),
    'görünmüyor · 2 dk önce',
  )
})

test('gorunenAd: girişimcide kurum öne (brief §3)', () => {
  assert.equal(gorunenAd({ role: 'founder', name: 'Cem Erdem', org: 'Nova Robotik' }), 'Nova Robotik · Cem Erdem')
  assert.equal(gorunenAd({ role: 'founder', name: 'Cem Erdem', org: '' }), 'Cem Erdem')
  assert.equal(gorunenAd({ role: 'investor', name: 'Ayşe Demir', org: 'Atlas' }), 'Ayşe Demir')
})

test('gruplaRol: rol sırası sabit (yatırımcı→girişimci→misafir), boş grup atlanır', () => {
  const gruplar = gruplaRol([
    { id: '1', role: 'founder' },
    { id: '2', role: 'investor' },
    { id: '3', role: 'founder' },
  ])
  assert.deepEqual(gruplar.map((g) => g.rol), ['investor', 'founder'])
  assert.deepEqual(gruplar.map((g) => g.baslik), ['Yatırımcılar', 'Girişimciler'])
  assert.deepEqual(gruplar.map((g) => g.kisiler.length), [1, 2])
  // grup içi orijinal sıra korunur (sakin sıralama: sunucu sırası)
  assert.deepEqual(gruplar[1].kisiler.map((k) => k.id), ['1', '3'])
})

test('gruplaRol: misafir grubu da olur', () => {
  const gruplar = gruplaRol([{ id: '1', role: 'guest' }])
  assert.deepEqual(gruplar.map((g) => g.baslik), ['Misafirler'])
})
