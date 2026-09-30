// Hash yönlendirme: panodaki "Kişi ata" masayı o kartla açar.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { rotaAdi, rotaKart, kartVerAdresi } from './useRota.js'

test('rotaAdi: kart-ver (parametreli ya da değil), kurulum; diğer her şey pano', () => {
  assert.equal(rotaAdi('#/kart-ver'), 'kart-ver')
  assert.equal(rotaAdi('#/kart-ver?kart=14'), 'kart-ver')
  assert.equal(rotaAdi('#/'), 'pano')
  assert.equal(rotaAdi(''), 'pano')
  assert.equal(rotaAdi('#/kart-verx'), 'pano')
  assert.equal(rotaAdi('#/kurulum'), 'kurulum')
})

test('rotaKart: yalnız sayısal kart no', () => {
  assert.equal(rotaKart('#/kart-ver?kart=14'), '14')
  assert.equal(rotaKart('#/kart-ver'), null)
  assert.equal(rotaKart('#/kart-ver?kart=abc'), null)
  assert.equal(rotaKart('#/?kart=14'), null)
})

test('kartVerAdresi: gidiş-dönüş', () => {
  assert.equal(rotaKart(kartVerAdresi('14')), '14')
  assert.equal(kartVerAdresi(null), '#/kart-ver')
})
