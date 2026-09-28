// Yakınlık Takip Sistemi — mock SSE sunucusu (pano.py ikizi)
// Brief §5 sözleşmesinin birebir aynısını üretir: GET /state, GET /events
// (2 Hz tam durum), POST /control {reset|threshold}. Bağımlılık yok.
//
//   node mock-server/mock.js [--port=8002] [--kisi=25] [--tohum=42]
//                            [--hizlandir=1] [--kopma=1] [--anlasmaSn=0]
//
// --hizlandir: benzetim zamanı çarpanı (testte 60–120 ile dakikalar saniyeye iner)
// --kopma:     alıcı kopması senaryosu (120. sn'de 20 sn, sonra her 6 dk'da)
// --anlasmaSn: rules.dealAfterS — masa testi için anlaşma süresini zorlar

import http from 'node:http'

// ---------- ayarlar ----------
const arg = Object.fromEntries(process.argv.slice(2).map((a) => {
  const [k, v] = a.replace(/^--/, '').split('=')
  return [k, v === undefined ? true : Number(v)]
}))
const PORT = arg.port ?? 8002
const KISI_SAYISI = arg.kisi ?? 25
const TOHUM = arg.tohum ?? 42
const HIZ = arg.hizlandir ?? 1
const KOPMA = (arg.kopma ?? 1) !== 0
const ANLASMA_SN = arg.anlasmaSn || null

const TIK_MS = 500                 // gerçek zaman; yayın da bu kadans (2 Hz)
const DT = (TIK_MS / 1000) * HIZ   // benzetim saniyesi / tik
const GIRIS_SN = 5                 // brief §2: giriş gecikmesi
const CIKIS_SN = 15                // brief §2: çıkış gecikmesi
const GRAFIK_SN = 90
const ETKINLIK_DK = 180            // event.progress için varsayılan süre

// Brief §10 KOYU paleti — mock, gerçek sunucu gibi BU paletten atar;
// açık tema uyarlaması arayüz tarafındadır (src/api/renkler.js).
const PALET = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#9085e9', '#e66767']

// ---------- tohumlu rastgelelik ----------
let rndDurum = TOHUM >>> 0
function rnd() { // mulberry32
  rndDurum = (rndDurum + 0x6d2b79f5) >>> 0
  let t = rndDurum
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const rndAralik = (a, b) => a + rnd() * (b - a)
const rndNormal = (orta, sapma) =>
  orta + sapma * Math.sqrt(-2 * Math.log(1 - rnd())) * Math.cos(2 * Math.PI * rnd())

// ---------- kişiler ----------
const ADLAR = ['Ayşe', 'Mehmet', 'Zeynep', 'Emre', 'Elif', 'Burak', 'Selin', 'Kaan', 'Merve', 'Deniz', 'Cem', 'İrem', 'Onur', 'Gizem', 'Barış', 'Ece', 'Tolga', 'Naz', 'Serkan', 'Pelin', 'Uğur', 'Aslı', 'Kerem', 'Duygu', 'Volkan', 'Buse', 'Halil', 'Melis', 'Ozan', 'Ceren']
const SOYADLAR = ['Demir', 'Kaya', 'Şahin', 'Yılmaz', 'Çelik', 'Arslan', 'Doğan', 'Kılıç', 'Aydın', 'Öztürk', 'Erdem', 'Polat', 'Koç', 'Güneş', 'Tekin', 'Aksoy', 'Bulut', 'Korkmaz', 'Yavuz', 'Özkan']
const FONLAR = ['Atlas Ventures', 'Boğaz Capital', 'Anadolu Fonu', 'Ege Girişim', 'Meridyen VC', 'Kule Yatırım', 'Fener Partners', 'Doruk Capital', 'Liman Ventures', 'Kuzey Fonu', 'Safir Yatırım', 'Çınar Capital']
const SIRKETLER = ['Nova Robotik', 'Peak Enerji', 'Bitki Teknoloji', 'Akıllı Tarım', 'Veri Köprüsü', 'Sağlık Cebi', 'Hızlı Kargo', 'Temiz Deniz', 'Oyun Evreni', 'Fin Radar', 'Eğitim Yıldızı', 'Şehir Sensör', 'Mutfak Robotu', 'Gök Harita', 'Ses Analiz']

function kisileriUret(adet) {
  const yatirimciAdet = Math.max(2, Math.round(adet * 0.4))
  const misafirAdet = Math.max(1, Math.round(adet * 0.12))
  const girisimciAdet = adet - yatirimciAdet - misafirAdet

  // kart no havuzu 2..99 karışık; 14 atanmamış-kart senaryosuna ayrılır
  const kartlar = []
  for (let n = 2; n < 100; n++) if (n !== 14) kartlar.push(String(n))
  for (let i = kartlar.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1)); [kartlar[i], kartlar[j]] = [kartlar[j], kartlar[i]]
  }

  const liste = []
  let adNo = 0
  const yeniAd = () => `${ADLAR[adNo % ADLAR.length]} ${SOYADLAR[(adNo++ * 7) % SOYADLAR.length]}`
  for (let i = 0; i < yatirimciAdet; i++) {
    const tier = [2, 3, 3, 3, 4, 4, 5][Math.floor(rnd() * 7)]
    liste.push({ id: kartlar.pop(), role: 'investor', name: yeniAd(), org: FONLAR[i % FONLAR.length], tier })
  }
  for (let i = 0; i < girisimciAdet; i++) {
    liste.push({ id: kartlar.pop(), role: 'founder', name: yeniAd(), org: SIRKETLER[i % SIRKETLER.length], tier: 0 })
  }
  for (let i = 0; i < misafirAdet; i++) {
    liste.push({ id: kartlar.pop(), role: 'guest', name: yeniAd(), org: '', tier: 0 })
  }
  liste.forEach((k, i) => {
    k.color = PALET[i % PALET.length]
    k.seenAgo = rndAralik(0, 2)
    k.min = 0; k.invMin = 0
    k.esler = new Set()          // şu an fiziksel olarak yanında olduğu kartlar
  })
  return liste
}

// ---------- benzetim durumu ----------
let kisiler = kisileriUret(KISI_SAYISI)
let simSn = 0                       // benzetim saniyesi (elapsed)
let ciftler = new Map()             // "a-b" → çift kaydı
let kenarlar = new Map()            // "a-b" → toplam dakika
let bildirimler = []
let anlasmalar = new Set()          // anlaşma çıkmış çift anahtarları
let bitenGorusme = 0
let esik = -72
let yalnizSn = new Map()            // yatırımcı id → kesintisiz yalnız sn
let atanmamisGeldi = false

// senaryo zamanları (benzetim sn)
const ATANMAMIS_SN = 45
const KAYIP_ARALIK = [180, 300]     // bu aralıkta bir kart susar
let kayipKisi = null
const kopmaPenceresi = (t) => KOPMA && ((t >= 120 && t < 140) || (t >= 480 && (t - 480) % 360 < 20))

const anahtar = (a, b) => (Number(a) < Number(b) ? `${a}-${b}` : `${b}-${a}`)
const kisiBul = (id) => kisiler.find((k) => k.id === id)
const gorunenAd = (k) => (k.role === 'founder' && k.org ? k.org : k.name)
const karsiRol = (a, b) =>
  (a.role === 'investor' && b.role === 'founder') || (a.role === 'founder' && b.role === 'investor')

function anlasmaSuresiSn(cift) {
  if (ANLASMA_SN) return ANLASMA_SN
  const [a, b] = [kisiBul(cift.a), kisiBul(cift.b)]
  if (!a || !b || !karsiRol(a, b)) return Infinity
  const tier = Math.max(a.tier, b.tier)
  const dk = { 2: 11, 3: 8, 4: 11, 5: 8 }[tier]   // brief §5.2 + §6.1
  return dk ? dk * 60 : Infinity
}

function bildir(kind, severity, title, detail, ids) {
  const simdi = new Date()
  bildirimler.push({
    t: simdi.getTime() / 1000,
    clock: `${String(simdi.getHours()).padStart(2, '0')}:${String(simdi.getMinutes()).padStart(2, '0')}`,
    kind, severity, title, detail, people: ids,
  })
}

// ---------- benzetim adımı ----------
function tik() {
  const kopma = kopmaPenceresi(simSn)
  simSn += DT

  // atanmamış kart sahneye girer (sunucu ikizinin kendiliğinden eklemesi)
  if (!atanmamisGeldi && simSn >= ATANMAMIS_SN) {
    atanmamisGeldi = true
    kisiler.push({
      id: '14', role: 'guest', name: 'Kart 14', org: '', tier: 0,
      color: PALET[kisiler.length % PALET.length],
      seenAgo: 0.5, min: 0, invMin: 0, esler: new Set(),
    })
  }

  // kayıp kart senaryosu: seçilen kart bir süre susar
  if (!kayipKisi && simSn >= KAYIP_ARALIK[0]) {
    kayipKisi = kisiler[Math.floor(kisiler.length / 3)]
    for (const esId of [...kayipKisi.esler]) fizikselAyril(kayipKisi.id, esId)
  }
  const kayipSessiz = kayipKisi && simSn >= KAYIP_ARALIK[0] && simSn < KAYIP_ARALIK[1]

  if (kopma) {
    // alıcı yok: hiç paket gelmez, herkesin seenAgo'su büyür, benzetim donar
    for (const k of kisiler) k.seenAgo += DT
    return
  }

  // duyulma: normalde herkes taze; susan kart hariç
  for (const k of kisiler) {
    k.seenAgo = (kayipSessiz && k === kayipKisi) ? k.seenAgo + DT : rndAralik(0, 2)
  }
  if (kayipKisi && !kayipSessiz && kayipKisi.kayipBildirildi) kayipKisi.kayipBildirildi = false

  // --- fiziksel eşleşme dinamiği ---
  const bosta = kisiler.filter((k) => k.esler.size === 0 && !(kayipSessiz && k === kayipKisi))
  const eslesmeOlasiligi = 0.010 * DT // kişi başına tik olasılığı
  for (const k of bosta) {
    if (k.esler.size > 0 || rnd() > eslesmeOlasiligi) continue
    const adaylar = bosta.filter((x) => x !== k && x.esler.size === 0)
    if (!adaylar.length) continue
    const karsi = adaylar.filter((x) => karsiRol(k, x))
    const es = (karsi.length && rnd() < 0.7) ? karsi[Math.floor(rnd() * karsi.length)] : adaylar[Math.floor(rnd() * adaylar.length)]
    const key = anahtar(k.id, es.id)
    k.esler.add(es.id); es.esler.add(k.id)
    const [a, b] = key.split('-')
    ciftler.set(key, {
      a, b, fiziksel: true, hedefSn: rndAralik(2, 14) * 60,
      fizikselSn: 0, ustundeSn: 0, altindaSn: 0,
      together: false, birlikteSn: 0, olcumler: [], sonDuyulma: simSn,
      bias: rndAralik(-3, 3), anlasmaVerildi: false,
    })
  }

  // --- çift ölçümleri, gecikmeler, süre birikimi ---
  for (const [key, c] of ciftler) {
    if (c.fiziksel) {
      c.fizikselSn += DT
      if (c.fizikselSn >= c.hedefSn || (kayipSessiz && (kisiBul(c.a) === kayipKisi || kisiBul(c.b) === kayipKisi))) {
        fizikselAyril(c.a, c.b)
      }
    }
    // ölçüm üret: yakınken güçlü, ayrıldıktan sonra zayıf
    const merkez = c.fiziksel ? -52 + c.bias : -84 + c.bias
    const ab = rnd() < 0.05 ? null : rndNormal(merkez, 3)
    const ba = rnd() < 0.05 ? null : rndNormal(merkez + rndAralik(-2, 2), 3)
    if (ab !== null || ba !== null) {
      const value = ab !== null && ba !== null ? (ab + ba) / 2 : (ab ?? ba)
      c.olcumler.push({ t: simSn, ab, ba, value })
      c.sonDuyulma = simSn
    }
    c.olcumler = c.olcumler.filter((o) => simSn - o.t <= GRAFIK_SN + 5)

    // giriş/çıkış gecikmesi (brief §2): 5 sn üstte → başlar, 15 sn altta → biter
    const son = c.olcumler.at(-1)
    const ustunde = son && son.value >= esik
    if (ustunde) { c.ustundeSn += DT; c.altindaSn = 0 } else { c.altindaSn += DT; c.ustundeSn = 0 }
    if (!c.together && ustunde && c.ustundeSn >= GIRIS_SN) {
      c.together = true; c.birlikteSn = 0
      if (anlasmalar.has(key)) {
        const [ka, kb] = [kisiBul(c.a), kisiBul(c.b)]
        bildir('repeat', 'deal', 'Yeniden bir arada',
          `${gorunenAd(ka)} ile ${gorunenAd(kb)} anlaşma sonrası tekrar bir araya geldi.`, [c.a, c.b])
      }
    }
    if (c.together) {
      c.birlikteSn += DT
      kenarlar.set(key, (kenarlar.get(key) ?? 0) + DT / 60)
      const [ka, kb] = [kisiBul(c.a), kisiBul(c.b)]
      ka.min += DT / 60; kb.min += DT / 60
      if (karsiRol(ka, kb)) { ka.invMin += DT / 60; kb.invMin += DT / 60 }
      if (!c.anlasmaVerildi && c.birlikteSn >= anlasmaSuresiSn(c)) {
        c.anlasmaVerildi = true
        anlasmalar.add(key)
        const yat = ka.role === 'investor' ? ka : kb
        const gir = yat === ka ? kb : ka
        bildir('deal', 'deal', 'Potansiyel anlaşma',
          `${yat.name} (${'★'.repeat(yat.tier)}) ile ${gorunenAd(gir)} ${Math.round(c.birlikteSn / 60)} dakikadır birlikte.`,
          [c.a, c.b])
      }
      if (!c.fiziksel && c.altindaSn >= CIKIS_SN) {
        c.together = false
        bitenGorusme++
      }
    }
    // artık ne fiziksel ne birlikte ne de yakın zamanda duyulmuşsa kaydı kapat
    if (!c.fiziksel && !c.together && simSn - c.sonDuyulma > 30) ciftler.delete(key)
  }

  // --- kişi durumları ve bildirim kuralları ---
  for (const k of kisiler) {
    const birlikteMi = [...k.esler].some((esId) => ciftler.get(anahtar(k.id, esId))?.together)

    // kayıp kart bildirimi (60 sn duyulmadı → ciddi)
    if (k.seenAgo >= 60 && !k.kayipBildirildi) {
      k.kayipBildirildi = true
      bildir('lost', 'serious', 'Kart sinyali kesildi',
        `${gorunenAd(k)} (kart ${k.id}) 1 dk'dır duyulmuyor.`, [k.id])
    }

    // yalnız kalan önemli yatırımcı (≥★★★, 6 dk)
    if (k.role === 'investor' && k.tier >= 3) {
      const yalniz = (yalnizSn.get(k.id) ?? 0)
      if (!birlikteMi && k.seenAgo < 30) {
        yalnizSn.set(k.id, yalniz + DT)
        if (yalniz + DT >= 360 && !k.yalnizBildirildi) {
          k.yalnizBildirildi = true
          bildir('idle_investor', 'warn', 'Önemli yatırımcı yalnız',
            `${k.name} (${'★'.repeat(k.tier)}) 6 dk'dır kimseyle görüşmüyor.`, [k.id])
        }
      } else {
        yalnizSn.set(k.id, 0)
        k.yalnizBildirildi = false
      }
    }
  }
}

function fizikselAyril(aId, bId) {
  const c = ciftler.get(anahtar(aId, bId))
  if (c) c.fiziksel = false
  kisiBul(aId)?.esler.delete(bId)
  kisiBul(bId)?.esler.delete(aId)
}

// ---------- durum nesnesi (brief §5.1 birebir) ----------
function durumUret() {
  const simdi = new Date()
  const kopma = kopmaPenceresi(simSn)

  const canli = []
  const sinyaller = []
  const gecmis = {}
  for (const [key, c] of ciftler) {
    if (simSn - c.sonDuyulma > 10) continue
    const pencere = c.olcumler.filter((o) => simSn - o.t <= 10)
    if (!pencere.length) continue
    const degerler = pencere.map((o) => o.value).sort((x, y) => x - y)
    const ortanca = degerler[Math.floor(degerler.length / 2)]
    const son = pencere.at(-1)
    sinyaller.push({
      a: c.a, b: c.b,
      ab: son.ab === null ? null : Math.round(son.ab * 10) / 10,
      ba: son.ba === null ? null : Math.round(son.ba * 10) / 10,
      value: Math.round(ortanca * 10) / 10,
      n: pencere.length,
      above: ortanca >= esik,
      together: c.together,
    })
    if (c.together) canli.push({ a: c.a, b: c.b, real: true, rssi: Math.round(ortanca * 10) / 10 })

    // grafik: son 90 sn, 2 sn'lik ortancalar, en eski başta
    const kovalar = new Map()
    for (const o of c.olcumler) {
      if (simSn - o.t > GRAFIK_SN) continue
      const kova = Math.floor((simSn - o.t) / 2)
      if (!kovalar.has(kova)) kovalar.set(kova, [])
      kovalar.get(kova).push(o.value)
    }
    const seri = [...kovalar.entries()]
      .sort((x, y) => y[0] - x[0])
      .map(([kova, degerlerK]) => {
        const s = degerlerK.sort((x, y) => x - y)
        return [kova * 2, Math.round(s[Math.floor(s.length / 2)] * 10) / 10]
      })
    if (seri.length) gecmis[key] = seri
  }

  const people = kisiler.map((k) => {
    const aktifCiftler = [...k.esler]
      .map((esId) => ciftler.get(anahtar(k.id, esId)))
      .filter((c) => c?.together)
    // fiziksel ayrılmış ama çıkış gecikmesi dolmamış görüşmeler de "birlikte"
    for (const [, c] of ciftler) {
      if (c.together && !aktifCiftler.includes(c) && (c.a === k.id || c.b === k.id)) aktifCiftler.push(c)
    }
    const durum = k.seenAgo > 30 ? 'away' : aktifCiftler.length ? 'talking' : 'idle'
    const esAdlari = aktifCiftler
      .map((c) => kisiBul(c.a === k.id ? c.b : c.a))
      .filter(Boolean).map(gorunenAd).join(', ')

    const karsiKisiler = new Set()
    for (const [key, dk] of kenarlar) {
      if (dk <= 0) continue
      const [a, b] = key.split('-')
      if (a !== k.id && b !== k.id) continue
      const es = kisiBul(a === k.id ? b : a)
      if (es && karsiRol(k, es)) karsiKisiler.add(es.id)
    }

    return {
      id: k.id, role: k.role, name: k.name, org: k.org, color: k.color,
      stars: '★'.repeat(k.tier), tier: k.tier,
      status: durum,
      withName: durum === 'talking' ? esAdlari : '',
      live: aktifCiftler.length ? Math.max(...aktifCiftler.map((c) => c.birlikteSn)) / 60 : 0,
      min: Math.round(k.min * 100) / 100,
      invMin: Math.round(k.invMin * 100) / 100,
      invPeers: karsiKisiler.size,
      seenAgo: Math.round(k.seenAgo * 10) / 10,
    }
  })

  const edges = [...kenarlar.entries()].map(([key, dk]) => {
    const [a, b] = key.split('-')
    return { a, b, min: Math.round(dk * 100) / 100 }
  })

  const girisimciler = kisiler.filter((k) => k.role === 'founder')
  const ulasan = new Set()
  for (const [key, dk] of kenarlar) {
    if (dk <= 0) continue
    const [a, b] = key.split('-').map(kisiBul)
    if (a && b && karsiRol(a, b)) ulasan.add((a.role === 'founder' ? a : b).id)
  }
  const karmaDk = [...kenarlar.entries()].reduce((toplam, [key, dk]) => {
    const [a, b] = key.split('-').map(kisiBul)
    return a && b && karsiRol(a, b) ? toplam + dk : toplam
  }, 0)

  return {
    people,
    live: canli,
    edges,
    alerts: bildirimler,
    stats: {
      done: bitenGorusme,
      livePairs: canli.length,
      mixedMin: Math.round(karmaDk * 10) / 10,
      deals: anlasmalar.size,
      reached: ulasan.size,
      founders: girisimciler.length,
    },
    receiverAge: kopma
      ? Math.round((simSn - kopmaBaslangici(simSn)) * 10) / 10
      : Math.round(rndAralik(0.1, 0.6) * 10) / 10,
    elapsed: Math.round(simSn * 10) / 10,
    event: {
      name: 'Yatırımcı Buluşması',
      sub: 'Yakınlık kartları · sahte veri',
      date: '28.09.2026 · Demo Salonu',
      progress: Math.min(1, simSn / (ETKINLIK_DK * 60)),
    },
    clock: simdi.toTimeString().slice(0, 8),
    threshold: esik,
    signals: sinyaller,
    history: gecmis,
    chartSeconds: GRAFIK_SN,
    rules: { dealAfterS: ANLASMA_SN },
  }
}

function kopmaBaslangici(t) {
  if (t >= 120 && t < 140) return 120
  return 480 + Math.floor((t - 480) / 360) * 360
}

function sifirla() {
  simSn = 0
  ciftler = new Map()
  kenarlar = new Map()
  bildirimler = []
  anlasmalar = new Set()
  bitenGorusme = 0
  yalnizSn = new Map()
  atanmamisGeldi = false
  kayipKisi = null
  for (const k of kisiler) {
    if (k.id === '14') continue
    k.min = 0; k.invMin = 0; k.esler = new Set()
    k.kayipBildirildi = false; k.yalnizBildirildi = false
    k.seenAgo = rndAralik(0, 2)
  }
  kisiler = kisiler.filter((k) => k.id !== '14')
}

// ---------- HTTP + SSE ----------
const sseIstemciler = new Set()

const sunucu = http.createServer((istek, yanit) => {
  if (istek.method === 'GET' && istek.url === '/state') {
    yanit.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
    yanit.end(JSON.stringify(durumUret()))
    return
  }
  if (istek.method === 'GET' && istek.url === '/events') {
    yanit.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    })
    yanit.write(`data: ${JSON.stringify(durumUret())}\n\n`)
    sseIstemciler.add(yanit)
    istek.on('close', () => sseIstemciler.delete(yanit))
    return
  }
  if (istek.method === 'POST' && istek.url === '/control') {
    let govde = ''
    istek.on('data', (parca) => { govde += parca })
    istek.on('end', () => {
      let komut
      try { komut = JSON.parse(govde) } catch { komut = null }
      if (komut?.cmd === 'reset') {
        sifirla()
        yanit.writeHead(200, { 'Content-Type': 'application/json' })
        yanit.end('{"ok":true}')
      } else if (komut?.cmd === 'threshold' &&
                 typeof komut.value === 'number' && komut.value >= -100 && komut.value <= -20) {
        esik = komut.value
        yanit.writeHead(200, { 'Content-Type': 'application/json' })
        yanit.end('{"ok":true}')
      } else {
        yanit.writeHead(400, { 'Content-Type': 'application/json' })
        yanit.end('{"ok":false,"hata":"gecersiz komut"}')
      }
    })
    return
  }
  yanit.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
  yanit.end('Yakınlık mock sunucusu — uçlar: GET /state, GET /events (SSE), POST /control\n')
})

setInterval(() => {
  tik()
  if (sseIstemciler.size) {
    const veri = `data: ${JSON.stringify(durumUret())}\n\n`
    for (const istemci of sseIstemciler) istemci.write(veri)
  }
}, TIK_MS)

sunucu.listen(PORT, () => {
  console.log(`mock dinliyor: http://localhost:${PORT}  (kişi=${KISI_SAYISI}, tohum=${TOHUM}, hız=${HIZ}x, kopma=${KOPMA ? 'açık' : 'kapalı'})`)
})
