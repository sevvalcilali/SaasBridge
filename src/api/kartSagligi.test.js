// Kart sağlığı: sorun ölçütleri ve sıralama.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { kartSorunlari, kartSagligi, sorunluSayisi } from './kartSagligi.js'

const tur = (k) => kartSorunlari(k).map((s) => s.tur)

test('kartSorunlari: kayıp (≥60 sn), görünmüyor (>30 sn), pil düşük (<%20)', () => {
  assert.deepEqual(tur({ seenAgo: 0.5, pil: 90 }), [])
  assert.deepEqual(tur({ seenAgo: 31, pil: 90 }), ['sessiz'])
  assert.deepEqual(tur({ seenAgo: 30, pil: 90 }), [])
  assert.deepEqual(tur({ seenAgo: 60, pil: 10 }), ['kayip', 'pil'])
  assert.deepEqual(tur({ seenAgo: 1, pil: 19 }), ['pil'])
})

test('kartSagligi: sorunlular üstte (ağır önce), gerisi numaraya göre; kişi kart no ile eşlenir', () => {
  const kartlar = [
    { kart: '5', seenAgo: 0.2, pil: 80, atanan: 'k1' },
    { kart: '3', seenAgo: 0.1, pil: 12, atanan: null },
    { kart: '40', seenAgo: 75, pil: 70, atanan: 'k2' },
    { kart: '2', seenAgo: 0.4, pil: 95, atanan: null },
    { kart: '9', seenAgo: 40, pil: 60, atanan: 'k3' },
  ]
  const people = [{ id: '5', name: 'Ayşe' }, { id: '40', name: 'Cem' }, { id: '9', name: 'Deniz' }]
  const r = kartSagligi(kartlar, people)
  assert.deepEqual(r.map((x) => x.kart), ['40', '9', '3', '2', '5'])
  assert.equal(r[0].kisi.name, 'Cem')
  assert.equal(r.find((x) => x.kart === '2').kisi, null, 'boştaki kart')
  assert.equal(sorunluSayisi(r), 3)
})
