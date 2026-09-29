// Durumdan türetilen küçük kararlar — JSX içinde hesap yok (temiz mimari).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { aliciBagli } from './durum.js'

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
