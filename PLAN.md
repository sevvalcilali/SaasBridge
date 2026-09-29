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

### ✅ Faz 0 — Temel altyapı
**Tamamlandı 28.09.2026.** Git + Vite/React, tokens.css, mock sunucu, api/client.js,
api/format.js, api/renkler.js. 36/36 test yeşil; tarayıcı kabul testi geçti.

---

> **Faz-sonu yeniden planlama kuralı:** Her faz tamamlandığında bir sonraki
> faz mikro-adımlarıyla birlikte yeniden planlanır. Bu planda Faz 1 mikro
> düzeyde, diğer fazlar kaba düzeyde tanımlıdır. Faz 1 bitince Faz 2
> mikro-adımları yazılır, vb.

---

### ⬜ Faz 1 — Organizatör canlı panosu (mikro-adımlar)
**Amaç:** Brief'in 1 numaralı önceliği; gerçek API ile de hemen çalışır.
**Yöntem:** Her adım kendi commit'ini alır; test veya ekran görüntüsüyle doğrulanır.

#### 1.1 ✅ Sayfa düzeni iskeleti
- Yönlendirme yok (tek sayfa); `App.jsx` → `<PanoEkrani>` bileşeni.
- CSS Grid ile 3 bölgeli düzen: üst şerit, gövde (sol kişi + orta ağ + sağ bildirim),
  alt şerit. Tablet için 1 sütuna düşen breakpoint (≤900px).
- **Doğrulama:** Tarayıcıda boş iskelet görünür; geniş ve dar pencerede düzen değişir.

#### 1.2 ✅ Üst şerit
- Etkinlik adı, alt başlık, tarih/mekân (`durum.event.*`).
- Büyük saat (`durum.clock`; tabular-nums ile titremesin).
- **ALICI BAĞLI / BAĞLI DEĞİL** rozeti (`receiverAge > 5 → ciddi`).
- Eşik değeri göstergesi (`durum.threshold` dBm; tıklayınca Faz 3'e gidecek,
  şimdilik sadece göster).
- Sıfırla düğmesi: tıklayınca `window.confirm` ile onay → `baglanti.sifirla()`.
- **Doğrulama:** Bant, saat ve rozet canlı veriyle görünür; mock'ta `--kopma=1` ile
  "BAĞLI DEĞİL" rozeti belirir.

#### 1.3 ✅ Kişi listesi — temel satır
- `KisiSatiri` bileşeni: renk dairesi, rol şekli (brief §6.4: ○ yatırımcı, □ girişimci,
  ◇ misafir), ad (girişimcide kurum + ad), yıldız, durum cümlesi, toplam süre.
- Liste `people` dizisini rol gruplarıyla gösterir (Yatırımcılar / Girişimciler başlığı).
- **Doğrulama:** 25 kişilik senaryoda tüm satırlar doğru biçimde render.

#### 1.4 ✅ Kişi listesi — durum renkleri ve "birlikte" vurgusu
- `talking` → `birlikte-zemin` + `birlikte` kenarlık + "X ile · 3 dk 20 sn".
- `idle` → normal zemin + "boşta".
- `away` → `pasif-zemin` + "görünmüyor · 2 dk önce".
- Atanmamış kart (`/^Kart \d+$/`) için öne çıkan "Kişi ata" düğmesi (henüz
  tıklama işlevi yok — Faz 2'ye köprü).
- **Doğrulama:** Ekran görüntüsünde üç durum rengi birbirinden ayrılır; atanmamış
  kart sarı/turuncu vurguyla belirgin.

#### 1.5 ✅ Kişi listesi — arama ve filtre
- Arama kutusu: ad/kurum/kart no üzerinde `includes` (büyük-küçük harf duyarsız).
- Filtre düğme grubu: Tümü | Yatırımcı | Girişimci | Birlikte | Boşta |
  Görünmüyor | Hiç görüşmemiş (invPeers === 0 ve rol founder).
- Seçili filtre `localStorage`'da saklanır; sayfa yenilenince korunur.
- **Doğrulama:** "Hiç görüşmemiş" filtresi yalnız invPeers=0 girişimcileri gösterir;
  sayfa yenilenince filtre korunur.

#### 1.6 ✅ Kişi listesi — sakin sıralama
- Liste sırası saniyede 2 güncellemeyle DEĞİŞMEZ; yalnız `status` değişince
  (talking↔idle↔away) satır konumu güncellenir — CSS `transition` ile.
- **Doğrulama:** Mock çalışırken liste sürekli zıplamaz; durum değişen satır
  yumuşak geçişle yer değiştirir.

#### 1.7 ⬜ Bildirim akışı paneli
- En yeni üstte; `kind`'a göre ikon (SVG, `/better-icons`):
  `deal` → altın yıldız, `repeat` → yineleme, `idle_investor` → saat,
  `lost` → sinyal kesik, `no_investor` → uyarı üçgeni.
- Bildirim `severity`'sine göre sol kenarlık rengi (olumlu / uyarı / ciddi).
- Tıklayınca `vurgulananKisiler` state'ini ayarlar (bir sonraki adımda
  kişi listesinde ve ağda vurgu efekti).
- Son 20 bildirim; daha fazlası için "tümünü göster" kaydırma.
- **Doğrulama:** Mock hızlandırılmış modda (--hizlandir=60) anlaşma ve kayıp kart
  bildirimleri görünür; ikon ve renk kurallarına uygun.

#### 1.8 ⬜ Bildirim → kişi vurgulama bağlantısı
- Bildirime tıklayınca `vurgulananKisiler` set edilir; kişi satırları ve ağ
  düğümleri parıldama efekti alır (box-shadow pulse, 3 sn sonra söner).
- **Doğrulama:** Bir bildirime tıklanınca ilgili kişi satırı/satırları vurgulanır.

#### 1.9 ⬜ Alt şerit — özet sayılar ve ilerleme
- `stats` alanları kutu sırasıyla: şu an birlikte | biten görüşme |
  karma görüşme (sureYazisi) | potansiyel anlaşma | ulaşan/toplam girişimci.
- Etkinlik ilerleme çubuğu (`event.progress`; null ise gizli).
- **Doğrulama:** Sayılar canlı değişir; ilerleme çubuğu mock'ta 3 saat
  etkinlikle yavaş ilerler.

#### 1.10 ⬜ Hata bantları
- "Sunucuya bağlanılamıyor" bantı: `baglandi === false` ise sayfanın üstünde
  ciddi renkli bant + son veri soluk opacity. Bağlantı gelince kalkar.
- "ALICI BAĞLI DEĞİL" bantı: `receiverAge > 5` ise ayrı ciddi bant.
- İkisi birden olabilir (üst üste).
- **Doğrulama:** Mock kapatılınca bant belirir, tekrar açılınca kalkar; veri silinmez.

#### 1.11 ⬜ Ağ görünümü — düğümler
- `AgGorunumu` bileşeni: SVG, sabit deterministik yerleşim.
  - Yatırımcılar sol sütun, girişimciler sağ sütun, misafirler alt sıra
    (sıra `people` dizisindeki sıra ile aynı — zıplama yok).
  - Düğüm = kişinin rengiyle dolu rol şekli (daire/kare/baklava) + ad etiketi.
- "Bu düğümlerin konumu fiziksel konum değildir" yazısı SVG altında.
- **Doğrulama:** 25 kişilik senaryoda düğümler okunaklı dağılır; konum uyarısı görünür.

#### 1.12 ⬜ Ağ görünümü — çizgiler
- `edges` dizisinden çizgiler: kalınlık = `Math.min(1 + min * 0.4, 8)`.
- `live` dizisindeki çiftler yeşil ve `stroke-dasharray` animasyonlu
  (yavaş, sakin — brief "sakin hareket" kuralı).
- **Doğrulama:** Birlikte olan çiftlerin yeşil çizgisi, geçmiş görüşmelerin
  gri çizgisi görünür; kalınlık farkı ayırt edilebilir.

#### 1.13 ⬜ Ağ + vurgulama entegrasyonu
- Bildirim tıklamasından gelen `vurgulananKisiler`, ağ düğümlerini de vurgular
  (parlak halka + diğerleri soluk).
- **Doğrulama:** Bildirime tıklayınca hem listede hem ağda aynı kişiler parlar.

#### 1.14 ⬜ Basit kişi detay paneli
- Kişi satırına veya ağ düğümüne tıklayınca sağda açılan panel:
  - Ad, rol, kurum, yıldız, kart no.
  - "Kiminle ne kadar" tablosu (`edges` filtrelenmiş, o kişiye ait).
  - Kart bilgisi: son duyulma, durum.
- Kapatma düğmesi. Aynı anda yalnız 1 panel açık.
- **Doğrulama:** Bir kişiye tıklayınca panel doğru verilerle açılır; ikinci
  kişiye tıklayınca ilki kapanır.

#### 1.15 ⬜ Tablet düzeni (responsive)
- ≤900px: ağ görünümü gövdenin altına iner; bildirimler üstte yatay kaydırma.
- ≤600px: tek sütun; ağ varsayılan gizli, "Ağı göster" düğmesiyle açılır.
- `localStorage`'da son açık sekme (liste / ağ / bildirimler) korunur.
- **Doğrulama:** Ekran görüntüleri — 1280px, 900px, 600px genişlik.

#### 1.16 ⬜ 50 kişi stres testi + son dokunuşlar
- Mock `--kisi=50` ile başlatılır; tüm bileşenler akıcı ve okunaklı mı kontrol.
- React performans: gereksiz yeniden render'lar `React.memo` ve `useMemo` ile
  engellenir (saniyede 2 güncelleme x 50 kişi).
- **Kabul ölçütü (Faz 1 tamamı):**
  - 25 ve 50 kişilik ekran görüntüleri teslim edildi.
  - Tasarım gerekçesi notu ("neyi neden böyle yaptım") yazıldı.
  - Tüm brief §7 ve §10 kuralları doğrulandı.

---

### ⬜ Faz 2 — Kart atama ekranı (karşılama masası) ⭐
**Amaç:** Brief'in en önemli yeni özelliği. Tamamı §9 mock uçlarıyla çalışır.

> ⚠️ Faz 1 bittiğinde mikro-adımları bu bölümün yerine yazılacak.

**Kaba adımlar (Faz 1 sonunda detaylandırılacak):**
- 2.a Mock API katmanı: `/api/people`, `/api/assign`, `/api/cards` mock uçları.
- 2.b Kişi seç/oluştur formu (dokunmatik-ayakta kullanım, büyük hedefler).
- 2.c Kart seç: "yaklaştır ve tanı" mock simülasyonu + numara girme.
- 2.d Kontrol adımı (zaten atanmış mı) ve onay kartı.
- 2.e Diğer işlemler: iade, kart değişimi, geri al, düzenleme.
- 2.f CSV toplu ön yükleme, "boştaki kartlar" şeridi, kayıp kart etiketi.
- 2.g SUNUCUDAN_ISTENENLER.md teslimi.

### ⬜ Faz 3 — Kurulum / eşik ekranı

> ⚠️ Faz 2 bittiğinde mikro-adımları yazılacak.

**Kaba adımlar:**
- 3.a Eşik kaydırıcısı + debounced POST /control.
- 3.b Canlı sinyal grafiği (SVG/Canvas, son 90 sn).
- 3.c Çift tablosu (ab/ba, above vs together farkı).
- 3.d Kalibrasyon sihirbazı (3 adım, görsel anlatım).
- 3.e Kart sağlığı tablosu.

### ⬜ Faz 4 — Kişi detay paneli (derin) + etkinlik sonrası rapor

> ⚠️ Faz 3 bittiğinde mikro-adımları yazılacak.

**Kaba adımlar:**
- 4.a Görüşme zaman çizelgesi (`/api/sessions` mock).
- 4.b Rapor sayfası (kim kimle toplam kaç dk, yazdırma/PDF dostu).
- 4.c CSV dışa aktarma.

### ⬜ Faz 5 — Cilalar (isteğe bağlı, ayrıca onaylanır)

> ⚠️ Faz 4 bittiğinde mikro-adımları yazılacak.

**Kaba adımlar:**
- 5.a Sunum modu (`?clean=1`).
- 5.b Koyu tema (token değer seti ekleme).
- 5.c 100+ kişi performans iyileştirmeleri.

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
