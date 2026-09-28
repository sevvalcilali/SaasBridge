# Yakınlık Takip Sistemi — Arayüz Projesi Planı

> Kaynak gereksinim belgesi: `UI_TASARIM_BRIEF.md`
> Bu dosya projenin yol haritası ve çalışma sözleşmesidir.
> Plan tarihi: 28.09.2026 · Proje sahibi: Şevval (arayüz) · Backend: Muhittin (pano.py)

---

## 0. ÇALIŞMA KURALLARI (Claude için — pazarlıksız)

### Onay kuralları
1. **Onaysız hiçbir faza başlanmaz.** Her faz, Şevval açıkça "başla" demeden
   başlamaz; faz bitince sonuç gösterilir ve bir sonraki faz için yeniden onay alınır.
2. **Faz kapsamı dışına çıkılmaz.** Faz sırasında akla gelen "hazır buradayken
   şunu da yapayım" işleri yapılmaz; PLAN'a not düşülür, onayla sıraya girer.
3. **Yıkıcı/geri alınamaz işlemler her zaman ayrıca sorulur:** dosya silme,
   veri sıfırlama, git geçmişi değiştirme, bağımlılık ekleme/çıkarma,
   plan/mimari değişikliği.
4. **Belirsizlikte uydurma yok.** Brief'te cevabı olmayan her karar önce
   Şevval'e sorulur; brief'in "Kavramlar" bölümünde olmayan kavram icat edilmez.
5. Her faz sonunda teslim: **ekran görüntüsü + kısa "neyi neden böyle yaptım"
   notu** (brief §12'nin istediği format).

### Mimari kuralları — "arka planda iş ne kadar karışık olursa olsun, kod tertemiz"
1. **Katman ayrımı kesin:**
   - `api/` → sunucuyla konuşan TEK yer. Ekran bileşenleri asla fetch/SSE yapmaz.
   - `screens/` → ekranlar; sadece görüntüler ve kullanıcı olayını iletir.
   - `components/` → ekranlar arası ortak, tek işli, bağımsız test edilebilir parçalar.
   - `theme/` → tüm renk/boşluk/yazı değerleri CSS token'ı. Bileşen içinde
     sabit renk kodu (hex) yazmak yasak.
2. **Tek sorumluluk:** Bir dosya bir iş yapar. Bir dosya büyümeye başladıysa
   bu, ikiye bölünme sinyalidir. "Ne yapar / nasıl kullanılır / neye bağımlı"
   sorularına tek cümleyle cevap veremeyen birim yeniden tasarlanır.
3. **Veri dönüşümü tek yerde:** Birim çevirileri (dk/sn → "3 dk 20 sn",
   "az önce"), sıralama, filtreleme gibi mantık `api/` ve yardımcı
   modüllerde yaşar; JSX içinde hesap yapılmaz.
4. **YAGNI:** İhtiyaç doğmadan soyutlama, ayar, seçenek eklenmez.
   Bağımlılık eklemek istisnadır, varsayılan değil (her yeni paket onaya tabi).
5. **Mock ↔ gerçek geçişi tek noktadan:** Gerçek sunucu geldiğinde değişecek
   tek şey `api/client.js` içindeki adres olmalı. Bu bozulursa mimari hatalıdır.
6. **İsimlendirme tutarlı:** Arayüz metinleri ve alan adları Türkçe kavram
   sözlüğüne (brief §3) uyar; kod tanımlayıcıları tek dilde ve tutarlı.

### Brief'in pazarlıksız ürün kuralları (her fazda geçerli)
- **Metre/cm asla gösterilmez**, sinyal metreye çevrilmez.
- **Konum/harita/ısı haritası yok** — düğüm konumu fiziksel konum değildir, bu belli edilir.
- **Ses/konuşma iması yok** — "konuşma" değil "birlikte".
- **Yeşil = yalnızca "şu an birlikte".** Başka anlamda yeşil kullanılmaz.
- **Kimlik asla sadece renkle verilmez:** renk + ad + rol şekli birlikte.
- Kişi rengi kişiyi takip eder, asla sıraya göre değişmez.
- Durumlar renk + ikon + yazı üçlüsüyle verilir (renk körlüğü).
- **Sakin hareket:** liste zıplamaz, kartlar titremez; görüşmelerin ~5 sn geç
  başlayıp ~15 sn geç bitmesi normaldir, hata gibi gösterilmez.
- **Tamamen çevrimdışı çalışır:** CDN, uzak font, harici servis yasak.
- Tüm metinler Türkçe; tarih `28.09.2026`, saat `14:05`, süre `3 dk 20 sn`.
- Kart no 100+ dinleyici cihazdır, kişi listelerinde gösterilmez.
- Süre birimlerine dikkat: `live/min/invMin/edges.min` **dakika**;
  `seenAgo/receiverAge/elapsed` **saniye**.

### Kullanılacak skill'ler (faz bazında)

| Skill | Ne zaman / nasıl |
|---|---|
| `/frontend-design` | Faz 1 ve 2'de ekran tasarımına başlarken — görsel yön ve tipografi rehberi |
| `/theme-factory` | Faz 0'da `tokens.css` kurulurken — "sıcak ve samimi" krem/pastel temanın token setini üretmek için (koyu lacivert değil; Bölüm 1'deki tema kararı geçerli) |
| `/vercel-composition-patterns` | Faz 1'de ortak bileşenler (liste satırı, panel, rozet) kurulurken — bileşen yapısı desenleri |
| `/vercel-react-best-practices` | Her fazın kod bitiminde — React kodu gözden geçirme (temiz mimari kuralının denetimi) |
| `/better-icons` | Faz 1'de bildirim/durum/rol ikonları seçilirken — SVG'ler projeye yerel gömülür (çevrimdışı kuralı) |
| `/a11y-audit` | Her fazın teslim öncesinde — erişilebilirlik denetimi (renk körlüğü, kontrast; brief §10 kuralları) |
| `/webapp-testing` | Faz kabul ölçütlerini doğrularken — mock senaryo üzerinde uçtan uca test |
| `/gsap-web` | Yalnız gerekçesi çıkarsa (ör. Faz 5 sunum modunda ağ görünümü geçişleri) ve **sakin hareket kuralı bozulmadan**; yeni bağımlılık olduğu için kullanım öncesi ayrıca onay alınır |

---

## 1. VERİLMİŞ KARARLAR

| Konu | Karar | Not |
|---|---|---|
| Backend erişimi | Şu an yok, beklenmeden başlanacak | Gerçek proje gelince `api/client.js`'ten bağlanılır |
| Teknoloji | **Vite + React** | Çıktı: tek `dist/` klasörü, sunucu statik verir |
| Tema | **Açık, sıcak-samimi** (krem zemin, pastel vurgular, yuvarlak hatlar) | Brief'in koyu varsayılanı bilinçli olarak değiştirildi (Şevval kararı). Token'lar sayesinde koyu tema ileride ucuza eklenebilir |
| Kişi paleti | Brief paleti açık zemine uyarlanır; **`#199e70` paletten çıkarılır** | Gerekçe: yeşil yalnızca "birlikte" durumunun rengi (brief §10 kendi önerisi) |
| Mock mimarisi | **Gerçek SSE mock sunucusu** (tek dosya Node) | pano.py ile birebir aynı sözleşme; EventSource/kopma davranışı gerçekçi test edilir |
| İlk hedef | **Organizatör panosu** | Brief §12 öncelik sırası korunuyor |

---

## 2. FAZLAR

Durum işaretleri: ⬜ onay bekliyor · 🟡 devam ediyor · ✅ bitti ve onaylandı

### ⬜ Faz 0 — Temel altyapı
**Amaç:** Diğer her fazın üzerine oturacağı iskelet.
- [ ] `git init` + Vite + React kurulumu; font dahil her varlık yerel.
- [ ] `theme/tokens.css`: sıcak açık tema token'ları + kişi paleti.
- [ ] `mock-server/mock.js`: brief §5.1 şemasının birebir aynısını üreten SSE
      sunucusu; 25 kişilik canlı senaryo (parametreyle 50); bildirim, alıcı
      kopması, atanmamış kart durumları dahil.
- [ ] `api/client.js`: SSE bağlantısı, kopunca yeniden deneme, tek durum deposu.
- [ ] `api/format.js`: birim çevirileri ("3 dk 20 sn", "az önce").
- **Kabul ölçütü:** `npm run dev` tek komutla mock + arayüzü başlatır; boş
  sayfa canlı veri aldığını gösterir; mock çıktısı brief şemasıyla alan alan uyumlu.

### ⬜ Faz 1 — Organizatör canlı panosu
**Amaç:** Brief'in 1 numaralı önceliği; gerçek API ile de hemen çalışır.
- [ ] Üst şerit: etkinlik adı/tarih, saat, **ALICI BAĞLI/DEĞİL** rozeti,
      eşik değeri + kısayol, Sıfırla (onay diyaloglu).
- [ ] Kişi listesi: Yatırımcı/Girişimci grupları, satırda renk + rol şekli +
      ad (girişimcide şirket önce) + yıldız + durum cümlesi + toplam süre;
      arama; filtre (rol / durum / hiç görüşmemiş); sakin sıralama
      (yalnız durum değişince, geçişli).
- [ ] Ağ görünümü: SVG, **sabit deterministik yerleşim** (rol gruplu),
      zıplama yok; çizgi kalınlığı = toplam süre; yeşil = şu an birlikte;
      "konum değildir" ibaresi.
- [ ] Bildirim akışı: en yeni üstte, tür ikonlu; tıklayınca ilgili kişiler vurgulanır.
- [ ] Alt şerit: `stats` + etkinlik ilerleme çubuğu.
- [ ] Basit kişi detay paneli (kiminle ne kadar, kart bilgisi).
- [ ] Hata bantları: alıcı yok / sunucuya bağlanılamıyor (son veri soluk, silinmez).
- [ ] Tablet düzeni; sekme/filtre `localStorage`'da.
- [ ] Atanmamış kart satırı "Kişi ata" düğmesiyle öne çıkar (Faz 2'ye köprü).
- **Kabul ölçütü:** 25 ve 50 kişilik mock senaryoda akıcı ve okunaklı;
  ekran görüntüleri + tasarım gerekçesi notu teslim edildi.

### ⬜ Faz 2 — Kart atama ekranı (karşılama masası) ⭐
**Amaç:** Brief'in en önemli yeni özelliği. Tamamı §9 mock uçlarıyla çalışır.
- [ ] Kişi seç/oluştur: kayıtlı listede ada göre arama; hızlı form
      (Ad, Rol büyük düğmeler, Kurum, Yıldız, Not); dokunmatik-ayakta kullanım.
- [ ] Kart seç: (a) "yaklaştır ve tanı" akışı (mock simülasyonu; çift kart
      uyarısı dahil), (b) numara girme + yalnız "şu an açık" kartların önerisi.
- [ ] Kontrol adımı: kart açık mı / son duyulma / pil / **zaten atanmış mı**
      ("Bu kart Ali Kaya'da. Geri alındı mı?").
- [ ] Onay kartı (kişinin rengiyle) → ekran anında sıfırlanır. Hedef: <15 sn/kişi.
- [ ] Diğer işlemler: iade, kart değişimi (süreler kişide birleşir),
      son atamayı geri al, kişi bilgisi düzenleme, CSV toplu ön yükleme,
      "boştaki kartlar" şeridi, kayıp kart etiketi.
- **Kabul ölçütü:** Akış mock ile uçtan uca oynanabilir; ekran görüntüleri +
  not + **`SUNUCUDAN_ISTENENLER.md`** (Muhittin'e verilecek netleştirilmiş
  §9 API listesi) teslim edildi.

### ⬜ Faz 3 — Kurulum / eşik ekranı
- [ ] Eşik kaydırıcısı -95…-35 dBm, büyük anlık değer; bırakınca ~250 ms
      sonra tek `POST /control` gönderimi.
- [ ] Canlı grafik: son 90 sn, çift başına çizgi (iki kişinin renkleri),
      eşik kesikli çizgisi, eşik üstü hafif yeşil dolgu, çizgi ucunda etiket,
      üzerine gelince değer, kişi perspektif filtresi.
- [ ] Çift tablosu: `ab`/`ba` ayrı, ortalama, birlikte sayılır/sayılmaz
      (`above` ≠ `together` ara durumu belirtilir), ölçüm sayısı.
- [ ] Kalibrasyon sihirbazı: yüz yüze → sırt sırta → "eşiği ortaya koy";
      adımlar görsel anlatımlı.
- [ ] Kart sağlığı tablosu: son duyulma, paket hızı, pil (mock), "sorunlu" etiketi.
- **Not:** dBm ve yön farkları yalnız bu ekranda gösterilebilir. Metre yine yok.

### ⬜ Faz 4 — Kişi detay paneli (derin) + etkinlik sonrası rapor
- [ ] Detay panelinde görüşme zaman çizelgesi (`/api/sessions` mock) ve
      kart kısayolları ("kartı değiştir / iade al").
- [ ] Rapor sayfası: kim kimle toplam kaç dk, girişimci→yatırımcı erişim
      özeti, en uzun görüşmeler; yazdırma/PDF dostu stil; CSV dışa aktarma (mock).

### ⬜ Faz 5 — Cilalar (isteğe bağlı, ayrıca onaylanır)
- [ ] Büyük ekran / sunum modu (`?clean=1` muadili, isimli/isimsiz).
- [ ] Koyu tema (token'lar hazır; yalnız değer seti eklenir).
- [ ] 100+ kişi performans ve okunabilirlik iyileştirmeleri.

---

## 3. PROJE YAPISI (hedef)

```
saasBridge/
├─ UI_TASARIM_BRIEF.md        # gereksinim belgesi (Muhittin)
├─ PLAN.md                    # bu dosya
├─ SUNUCUDAN_ISTENENLER.md    # Faz 2 çıktısı: Muhittin'e §9 API istek listesi
├─ mock-server/
│  └─ mock.js                 # tek dosya, bağımlılıksız Node SSE sunucusu
├─ src/
│  ├─ api/
│  │  ├─ client.js            # SSE + durum deposu (sunucuyla konuşan TEK yer)
│  │  └─ format.js            # birim/metin çevirileri
│  ├─ theme/
│  │  └─ tokens.css           # tüm tasarım token'ları
│  ├─ components/             # ortak parçalar (RolSekli, KisiRozeti, ...)
│  └─ screens/
│     ├─ Pano/                # Faz 1
│     ├─ KartVer/             # Faz 2
│     ├─ Kurulum/             # Faz 3
│     └─ Rapor/               # Faz 4
├─ index.html · vite.config.js · package.json
└─ dist/                      # npm run build çıktısı (sunucu bunu statik verir)
```

---

## 4. AÇIK SORULAR / BEKLEYENLER

- [ ] Gerçek backend klasörü Muhittin'den alınacak (hangi fazdaysak orada bağlanır).
- [ ] `pano/pano.html` ekran görüntüleri görülemedi — referans gerekirse istenecek.
- [ ] Bildirim tıklaması dışında ek bildirim özelliği YOK (brief §5.2: ses,
      telefon bildirimi vb. kapsam dışı).
