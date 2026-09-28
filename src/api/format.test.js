// Birim çevirileri sözleşmesi (brief §5.1 "Dikkat edilecekler"):
// dakika alanları insan diline "3 dk 20 sn" gibi, saniye alanları
// "az önce" gibi çevrilir. JSX içinde hesap yapılmaz; hepsi burada.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sureYazisi, onceYazisi } from './format.js'

test('sureYazisi: dakikayı "X dk Y sn" biçimine çevirir', () => {
  assert.equal(sureYazisi(3.34), '3 dk 20 sn')
  assert.equal(sureYazisi(0.41), '25 sn')
  assert.equal(sureYazisi(12.5), '12 dk 30 sn')
})

test('sureYazisi: tam dakikada saniye eki yok', () => {
  assert.equal(sureYazisi(3), '3 dk')
  assert.equal(sureYazisi(0), '0 sn')
})

test('sureYazisi: saniye 60\'a yuvarlanınca dakika taşar', () => {
  assert.equal(sureYazisi(2.999), '3 dk')
})

test('sureYazisi: bir saatten uzun süre "X sa Y dk"', () => {
  assert.equal(sureYazisi(75.5), '1 sa 16 dk')
  assert.equal(sureYazisi(60), '1 sa')
})

test('sureYazisi: veri yoksa uzun çizgi', () => {
  assert.equal(sureYazisi(null), '—')
  assert.equal(sureYazisi(undefined), '—')
})

test('onceYazisi: 10 sn altı "az önce"', () => {
  assert.equal(onceYazisi(0.1), 'az önce')
  assert.equal(onceYazisi(9.4), 'az önce')
})

test('onceYazisi: saniye ve dakika ölçekleri', () => {
  assert.equal(onceYazisi(25), '25 sn önce')
  assert.equal(onceYazisi(150), '2 dk önce')
  assert.equal(onceYazisi(3700), '1 sa önce')
})

test('onceYazisi: null = kart hiç duyulmadı (brief §5.1 seenAgo)', () => {
  assert.equal(onceYazisi(null), 'hiç duyulmadı')
  assert.equal(onceYazisi(undefined), 'hiç duyulmadı')
})
