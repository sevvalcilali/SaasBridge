// Ağ yerleşimi — deterministik, sabit. Düğüm konumu FİZİKSEL konum değildir;
// yalnız rol gruplu düzenli bir dağılım (brief §7: düğümler zıplamaz).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { agYerlesimi } from './agYerlesim.js'

const KISILER = [
  { id: '1', role: 'investor', color: '#111', name: 'A', org: 'Fon A' },
  { id: '2', role: 'investor', color: '#222', name: 'B', org: 'Fon B' },
  { id: '3', role: 'founder', color: '#333', name: 'C', org: 'Şir C' },
  { id: '4', role: 'founder', color: '#444', name: 'D', org: 'Şir D' },
  { id: '5', role: 'founder', color: '#555', name: 'E', org: 'Şir E' },
  { id: '6', role: 'guest', color: '#666', name: 'F', org: '' },
]
const W = 1000, H = 700
const yerlesim = () => agYerlesimi(KISILER, { w: W, h: H })

test('her kişi için bir düğüm, id/renk/rol korunur', () => {
  const d = yerlesim()
  assert.equal(d.length, KISILER.length)
  assert.deepEqual(d.map((n) => n.id), ['1', '2', '3', '4', '5', '6'])
  assert.equal(d.find((n) => n.id === '3').color, '#333')
})

test('yatırımcılar solda, girişimciler sağda, misafirler altta', () => {
  const d = yerlesim()
  const yat = d.filter((n) => n.role === 'investor')
  const gir = d.filter((n) => n.role === 'founder')
  const mis = d.filter((n) => n.role === 'guest')
  assert.ok(yat.every((n) => n.x < W / 2), 'yatırımcı solda değil')
  assert.ok(gir.every((n) => n.x > W / 2), 'girişimci sağda değil')
  assert.ok(mis.every((n) => n.y > H * 0.7), 'misafir altta değil')
})

test('grup içi sıra korunur (y artan) — sunucu sırası, zıplamaz', () => {
  const gir = yerlesim().filter((n) => n.role === 'founder')
  const yler = gir.map((n) => n.y)
  assert.deepEqual(yler, [...yler].sort((a, b) => a - b))
  assert.deepEqual(gir.map((n) => n.id), ['3', '4', '5'])
})

test('deterministik: aynı girdi aynı çıktı', () => {
  assert.deepEqual(yerlesim(), yerlesim())
})

test('tüm düğümler sınırlar içinde', () => {
  for (const n of yerlesim()) {
    assert.ok(n.x >= 0 && n.x <= W, `x sınır dışı: ${n.x}`)
    assert.ok(n.y >= 0 && n.y <= H, `y sınır dışı: ${n.y}`)
  }
})

test('tek kişilik grup ortalanır (bölme sıfır hatası yok)', () => {
  const d = agYerlesimi([{ id: '9', role: 'guest', color: '#000', name: 'Z', org: '' }], { w: W, h: H })
  assert.equal(d.length, 1)
  assert.ok(Number.isFinite(d[0].x) && Number.isFinite(d[0].y))
})
