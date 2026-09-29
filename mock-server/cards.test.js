// §9-3 "yaklaştır ve tanı": GET /api/cards alıcının her kartı duyduğu gücü verir.
// Bir kart alıcıya yaklaştırılınca (POST /api/yaklastir) belirgin öne çıkar.
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const MOCK = fileURLToPath(new URL('./mock.js', import.meta.url))
const acik = []
function baslat(args) { const c = spawn(process.execPath, [MOCK, ...args], { stdio: ['ignore', 'pipe', 'pipe'] }); acik.push(c); return c }
async function hazir(port) {
  for (let i = 0; i < 100; i++) { try { if ((await fetch(`http://localhost:${port}/state`)).ok) return } catch {} await new Promise((c) => setTimeout(c, 50)) }
  throw new Error('açılmadı')
}
const getj = async (u) => (await fetch(u)).json()
const post = (u, body) => fetch(u, { method: 'POST', body: JSON.stringify(body) })
after(() => { for (const c of acik) c.kill() })

const B = 'http://localhost:8113'

test('GET /api/cards: şema ve normalde hiçbir kart baskın değil', async () => {
  baslat(['--port=8113', '--kisi=25', '--tohum=5'])
  await hazir(8113)
  const kartlar = await getj(`${B}/api/cards`)
  assert.ok(kartlar.length >= 25)
  for (const k of kartlar) {
    assert.deepEqual(Object.keys(k).sort(), ['atanan', 'kart', 'pil', 'rssiAlici', 'seenAgo'])
    assert.equal(typeof k.rssiAlici, 'number')
    assert.ok(k.pil >= 0 && k.pil <= 100)
  }
  const enGuclu = Math.max(...kartlar.map((k) => k.rssiAlici))
  assert.ok(enGuclu <= -60, `normalde yakın kart olmamalı (en güçlü ${enGuclu})`)
})

test('atanan: başlangıç kadrosunun kartları bir kişiye atanmış', async () => {
  const kartlar = await getj(`${B}/api/cards`)
  const atanmis = kartlar.filter((k) => k.atanan)
  assert.ok(atanmis.length >= 25, 'atanmış kart yok')
})

test('POST /api/yaklastir: yaklaştırılan kart belirgin en güçlü olur', async () => {
  await post(`${B}/api/yaklastir`, { kart: '88' })  // yeni, atanmamış kart yaklaştırıldı
  const kartlar = await getj(`${B}/api/cards`)
  const yakin = kartlar.find((k) => k.kart === '88')
  assert.ok(yakin, 'yaklaştırılan kart /api/cards\'ta görünmeli')
  assert.equal(yakin.atanan, null)
  const digerEnGuclu = Math.max(...kartlar.filter((k) => k.kart !== '88').map((k) => k.rssiAlici))
  assert.ok(yakin.rssiAlici > -55, `yakın kart güçlü olmalı (${yakin.rssiAlici})`)
  assert.ok(yakin.rssiAlici - digerEnGuclu > 10, 'yakın kart diğerlerinden belirgin güçlü olmalı')
})

test('POST /api/yaklastir: iki kart yakınsa ikisi de güçlü (çift-kart)', async () => {
  await post(`${B}/api/yaklastir`, { kart: '90', kart2: '91' })
  const kartlar = await getj(`${B}/api/cards`)
  const guclu = kartlar.filter((k) => k.rssiAlici > -55).map((k) => k.kart)
  assert.ok(guclu.includes('90') && guclu.includes('91'), `iki kart da güçlü olmalı: ${guclu}`)
})
