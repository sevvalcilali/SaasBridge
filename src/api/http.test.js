// demoVarMi: demo düğmeleri yalnız mock'ta (GET /api/demo 200); gerçek sunucuda 404 → gizli.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import { demoVarMi } from './http.js'

async function sunucu(kod) {
  const s = http.createServer((i, y) => { y.writeHead(i.url === '/api/demo' ? kod : 404); y.end('{}') })
  await new Promise((c) => s.listen(0, c))
  return { adres: `http://localhost:${s.address().port}`, kapat: () => s.close() }
}

test('mock (200) → demo var; gerçek sunucu (404) → yok; ulaşılamayan → yok', async () => {
  const mock = await sunucu(200)
  const gercek = await sunucu(404)
  assert.equal(await demoVarMi(mock.adres), true)
  assert.equal(await demoVarMi(gercek.adres), false)
  assert.equal(await demoVarMi('http://localhost:1'), false)
  mock.kapat(); gercek.kapat()
})
