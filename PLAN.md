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

### ✅ Faz 1 — Organizatör canlı panosu (TAMAMLANDI 29.09.2026)
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

#### 1.7 ✅ Bildirim akışı paneli
- En yeni üstte; `kind`'a göre ikon (SVG, `/better-icons`):
  `deal` → altın yıldız, `repeat` → yineleme, `idle_investor` → saat,
  `lost` → sinyal kesik, `no_investor` → uyarı üçgeni.
- Bildirim `severity`'sine göre sol kenarlık rengi (olumlu / uyarı / ciddi).
- Tıklayınca `vurgulananKisiler` state'ini ayarlar (bir sonraki adımda
  kişi listesinde ve ağda vurgu efekti).
- Son 20 bildirim; daha fazlası için "tümünü göster" kaydırma.
- **Doğrulama:** Mock hızlandırılmış modda (--hizlandir=60) anlaşma ve kayıp kart
  bildirimleri görünür; ikon ve renk kurallarına uygun.

#### 1.8 ✅ Bildirim → kişi vurgulama bağlantısı
- Bildirime tıklayınca `vurgulananKisiler` set edilir; kişi satırları ve ağ
  düğümleri parıldama efekti alır (box-shadow pulse, 3 sn sonra söner).
- **Doğrulama:** Bir bildirime tıklanınca ilgili kişi satırı/satırları vurgulanır.

#### 1.9 ✅ Alt şerit — özet sayılar ve ilerleme
- `stats` alanları kutu sırasıyla: şu an birlikte | biten görüşme |
  karma görüşme (sureYazisi) | potansiyel anlaşma | ulaşan/toplam girişimci.
- Etkinlik ilerleme çubuğu (`event.progress`; null ise gizli).
- **Doğrulama:** Sayılar canlı değişir; ilerleme çubuğu mock'ta 3 saat
  etkinlikle yavaş ilerler.

#### 1.10 ✅ Hata bantları
- "Sunucuya bağlanılamıyor" bantı: `baglandi === false` ise sayfanın üstünde
  ciddi renkli bant + son veri soluk opacity. Bağlantı gelince kalkar.
- "ALICI BAĞLI DEĞİL" bantı: `receiverAge > 5` ise ayrı ciddi bant.
- İkisi birden olabilir (üst üste).
- **Doğrulama:** Mock kapatılınca bant belirir, tekrar açılınca kalkar; veri silinmez.

#### 1.11 ✅ Ağ görünümü — düğümler
- `AgGorunumu` bileşeni: SVG, sabit deterministik yerleşim.
  - Yatırımcılar sol sütun, girişimciler sağ sütun, misafirler alt sıra
    (sıra `people` dizisindeki sıra ile aynı — zıplama yok).
  - Düğüm = kişinin rengiyle dolu rol şekli (daire/kare/baklava) + ad etiketi.
- "Bu düğümlerin konumu fiziksel konum değildir" yazısı SVG altında.
- **Doğrulama:** 25 kişilik senaryoda düğümler okunaklı dağılır; konum uyarısı görünür.

#### 1.12 ✅ Ağ görünümü — çizgiler
- `edges` dizisinden çizgiler: kalınlık = `Math.min(1 + min * 0.4, 8)`.
- `live` dizisindeki çiftler yeşil ve `stroke-dasharray` animasyonlu
  (yavaş, sakin — brief "sakin hareket" kuralı).
- **Doğrulama:** Birlikte olan çiftlerin yeşil çizgisi, geçmiş görüşmelerin
  gri çizgisi görünür; kalınlık farkı ayırt edilebilir.

#### 1.13 ✅ Ağ + vurgulama entegrasyonu
- Bildirim tıklamasından gelen `vurgulananKisiler`, ağ düğümlerini de vurgular
  (parlak halka + diğerleri soluk).
- **Doğrulama:** Bildirime tıklayınca hem listede hem ağda aynı kişiler parlar.

#### 1.14 ✅ Basit kişi detay paneli
- Kişi satırına veya ağ düğümüne tıklayınca sağda açılan panel:
  - Ad, rol, kurum, yıldız, kart no.
  - "Kiminle ne kadar" tablosu (`edges` filtrelenmiş, o kişiye ait).
  - Kart bilgisi: son duyulma, durum.
- Kapatma düğmesi. Aynı anda yalnız 1 panel açık.
- **Doğrulama:** Bir kişiye tıklayınca panel doğru verilerle açılır; ikinci
  kişiye tıklayınca ilki kapanır.

#### 1.15 ✅ Tablet düzeni (responsive)
- ≤900px: ağ görünümü gövdenin altına iner; bildirimler üstte yatay kaydırma.
- ≤600px: tek sütun; ağ varsayılan gizli, "Ağı göster" düğmesiyle açılır.
- `localStorage`'da son açık sekme (liste / ağ / bildirimler) korunur.
- **Doğrulama:** Ekran görüntüleri — 1280px, 900px, 600px genişlik.

#### 1.16 ✅ 50 kişi stres testi + son dokunuşlar
- Mock `--kisi=50` ile başlatılır; tüm bileşenler akıcı ve okunaklı mı kontrol.
- React performans: gereksiz yeniden render'lar `React.memo` ve `useMemo` ile
  engellenir (saniyede 2 güncelleme x 50 kişi).
- **Kabul ölçütü (Faz 1 tamamı):**
  - 25 ve 50 kişilik ekran görüntüleri teslim edildi.
  - Tasarım gerekçesi notu ("neyi neden böyle yaptım") yazıldı.
  - Tüm brief §7 ve §10 kuralları doğrulandı.

---

### ✅ Faz 2 — Kart atama ekranı (karşılama masası) ⭐ (TAMAMLANDI 30.09.2026)
**Amaç:** Brief'in en önemli yeni özelliği (§6). Tamamı §9 mock uçlarıyla çalışır;
gerçek sunucu gelince yalnız `api/masaApi.js` değişir.

**Model kararı (2.1'de kurulur):** Kişi ≠ Kart. Bir **atama katmanı** eklenir.
- **Katılımcı** = kayıtlı insan (id, ad, rol, kurum, yıldız, not, renk, atananKart|null).
- **Kart** = fiziksel cihaz 1–99 (alıcıdaki güç, seenAgo, pil; atanan kişi|boş).
- `/state` çıktısı Faz 1 ile uyumlu kalır (pano bozulmaz): atanmış+duyulan kartlar
  kişi olarak, atanmamış duyulan kartlar "Kart N" olarak görünür.

#### 2.1 ✅ Mock: kişi/kart/atama modeli + katılımcı ve atama uçları
- Mock'u kişi≠kart modeline taşı; `/state` çıktısı alan-alan aynı kalsın (Faz 1 testleri geçmeli).
- `GET/POST /api/people`, `PATCH/DELETE /api/people/{id}`; `POST /api/assign {kisiId,kart}`,
  `POST /api/unassign {kart}`. Atama zaman damgalı geçmişe yazılır.
- **Doğrulama:** kişi ekle→ata→`/state`'te görünür; iade et→kart boşta; süreler silinmez. Mock testleri + Faz 1 şema testi yeşil.

#### 2.2 ✅ Mock: GET /api/cards + yaklaştır ve tanı + boştaki kartlar
- `GET /api/cards` → `[{kart, rssiAlici, seenAgo, atanan, pil}]`.
- Alıcıya yaklaştırılan kartın simülasyonu (tek kart çok güçlü); iki kart yakınsa ikisi de güçlü.
- **Doğrulama:** `/api/cards` şeması; "yaklaştır" senaryosunda bir kart belirgin öne çıkar; çift-kart durumu ayırt edilir. Mock testleri.

#### 2.3 ✅ api/masaApi.js — §9 uçlarıyla konuşan tek yer
- people/assign/unassign/cards için ince sarmalayıcı (client.js felsefesi: tek I/O noktası).
- **Doğrulama:** gerçek HTTP mock'a karşı uçtan uca (ekle/ata/iade/cards) birim testleri.

#### 2.4 ✅ Ekran yönlendirme + "Kart Ver" iskeleti
- Hafif yönlendirme (hash/yol): `/` = Pano, `/kart-ver` = Karşılama masası. Üstte geçiş.
- Dokunmatik-ayakta düzen iskeleti (büyük hedefler, az yazı).
- **Doğrulama:** iki ekran arası geçiş; iskelet tabette okunur.

#### 2.5 ✅ Adım 1 — Kişi seç / yeni kişi oluştur
- Kayıtlı listede ada göre arama; yoksa hızlı form: **Ad**, **Rol** (büyük düğmeler),
  **Kurum**, yatırımcıysa **Yıldız (1–5)**, **Not**. Kişi rengi atama anında belirir.
- **Doğrulama:** arama + yeni kişi oluşturma `/api/people`'a gider; büyük dokunma hedefleri.

#### 2.6 ✅ Adım 2a — Kartı numarayla seç
- Numara girişi; yalnız "şu an açık" (duyulan) kartlar önerilir (yeşil nokta = açık).
- **Doğrulama:** duyulmayan kart uyarısı; açık kartlar önerilir.

#### 2.7 ✅ Adım 2b — "Yaklaştır ve tanı" akışı
- "Kartı alıcıya yaklaştırın" → `/api/cards` yoklanır, en güçlü kart otomatik belirir ("Kart 14 bulundu ✓").
- İki kart yakınsa "İki kart algılandı, birini uzaklaştırın".
- **Doğrulama:** mock simülasyonunda kart otomatik bulunur; çift-kart uyarısı çıkar.

#### 2.8 ✅ Adım 3 — Kontrol (açık/son duyulma/pil/zaten atanmış)
- Seçilen kartın durumu; **zaten atanmışsa** "Bu kart Ali Kaya'da. Geri alındı mı?" onayı.
- **Doğrulama:** atanmış kart seçilince uyarı; evet→eski atama kapanır.

#### 2.9 ✅ Adım 4 — Onay kartı → ekran sıfırlanır
- Kişinin rengiyle "Ayşe Demir → Kart 14" özeti; onayla→`/api/assign`; ekran hemen sıradaki kişiye.
- **Doğrulama:** onaydan sonra kişi panoda görünür; ekran sıfırlanır; akış hızlı.

#### 2.10 ✅ İade + son atamayı geri al
- Kart iadesi (kişi "ayrıldı", kart boşta, **süreler silinmez**); "Geri al" (son atama).
- **Doğrulama:** iade→pano'dan düşer, rapor süreleri kalır; geri al son atamayı bozar.
- **Yapıldı (30.09.2026):** Kart Ver ekranında "Kart ver | Kart iadesi" seçimi; `IadePaneli`
  (kart no/ad/kurum ile ara → tek onay → `/api/unassign`). Son atama şeridi + "Geri al":
  brief §6 "son birkaç dakika" → `GERI_AL_DK = 5` (masaYardim.js; 2.9'daki 4 sn'lik
  kendiliğinden kalkma bu yüzden 5 dk oldu). Geri al yalnız kartı boşa çıkarır; eski sahibe/
  eski karta geri vermez (onlar fiziksel olarak geri alınmıştı). Mock düzeltmesi: "birlikte"
  olan kart iade edilince sunucu çöküyordu (`tik()` → silinmiş kart) — artık kartın çiftleri
  kapanır, kenarlar (kim kimle ne kadar) kalır. 107/107 test + tarayıcı uçtan uca.

#### 2.11 ✅ Kart değişimi + kişi bilgisi düzenleme
- Kart değişimi (kişi aynı, kart değişir, **süreler kişide birleşir**); ad/kurum/yıldız/rol düzenleme (renk değişmez).
- **Doğrulama:** kart değişince eski+yeni süre birleşir; düzenleme `/api/people`'a gider.
- **Yapıldı (30.09.2026):** Mock'ta kenarlar (kim kimle ne kadar) artık **kişiye** bağlı
  (Şevval onayı); `/state` çıktısı Faz 1 ile aynı (kenarlar güncel kart no ile). Kart
  değişiminde kişinin süresi ve kenarları yeni kartta birleşir; iade edilen kart başkasına
  verilince eski sahibin süreleri devredilmez; kartsız kişinin süreleri silinmez, panoda
  görünmez, yeni kart alınca geri gelir. Kart değişimi mevcut sihirbazla yapılır (kartı olan
  kişi seçilir); onayda "Kart değişimi … süreler birleşir" açıklaması. Kişi düzenleme:
  Adım 1 listesinde "Düzenle"; form yeni-kişi formuyla ortak (`KisiFormu.jsx`), yalnız
  değişen alanlar PATCH edilir (`duzenlemeFarki`), renk gösterilir ama değiştirilemez.
  Mock PATCH: geçersiz rol/boş ad yok sayılır, yıldız 0–5. 113/113 test + tarayıcı uçtan uca.

#### 2.12 ✅ CSV toplu ön yükleme + "kart bekliyor" listesi
- CSV (ad, soyad, rol, kurum, yıldız) yükle → `/api/people/import`; kartsız kişiler "kart bekliyor".
- **Doğrulama:** CSV yüklenir, kişiler listeye düşer, kapıda atanır.
- **Yapıldı (30.09.2026):** Kişiye `ayrildi` alanı (Şevval onayı): kart iadesi → `true`,
  kart verilince → `false`. `POST /api/unassign {kart, ayrildi}` — varsayılan `true`;
  "Geri al" `false` gönderir (yanlış atamada kişi ayrılmış sayılmaz); başkasından alınan kart
  da kişiyi ayrılmış yapmaz. `POST /api/people/import` ham CSV alır → `{eklenen, atlanan:
  [{satir, sebep}]}`: başlık varsa sütun adına göre, yoksa sırayla; ayraç `;` `,` sekme;
  tırnaklı alan; rol Türkçe/İngilizce; aynı ad+kurum ikinci kez eklenmez. Arayüz: dosya
  UTF-8, değilse Windows-1254 okunur (Türkçe Excel). Adım 1'de "Tümü | Kart bekliyor (n)"
  filtresi, satırda "kart bekliyor" / "ayrıldı" etiketi; yükleme sonrası bekleyenler açılır.
  Excel (.xlsx) desteği yok — bağımlılık gerektirir, istenirse onaya sunulur.
  123/123 test + tarayıcı uçtan uca.

#### 2.13 ✅ "Boştaki kartlar" şeridi + kayıp kart etiketi
- Atanmamış ama açık kartlar ayrı şeritte (stok takibi); `lost` bildirimli kişide "Kartı kontrol et" → pil/kart değişimi.
- **Doğrulama:** boştaki kartlar görünür; kayıp kart etiketi ve düzeltme akışı.
- **Yapıldı (30.09.2026):** Kart Ver ekranı `/api/cards`'ı 3 sn'de bir yoklar (`useKartlar`).
  Alttaki "Boştaki kartlar" şeridi: açık + atanmamış kartlar, numaraya göre sabit, pil
  %20 altı ⚠. Mock'a masadaki yedekler eklendi (6 kart; iade edilen kart da masaya döner):
  alıcı duyar, `/state`'te kişi olarak görünmez. Kayıp kart = atanmış kart ≥60 sn duyulmuyor
  (`lost` ile aynı ölçüt; masa SSE dinlemeden `/api/cards`'tan türetir): üstte ciddi renkli
  "⚠ Kartı kontrol et" şeridi + kişinin satırında etiket. "Kontrol et" → "Pil değiştirildi"
  (uyarı "sinyal bekleniyor"a döner, sinyal gelince kalkar) ya da "Kart değiştirildi"
  (sihirbaz o kişiyle Adım 2'den açılır → kart değişimi, süreler birleşir).
  Kararlar (soru sorulmadan, Şevval talimatı): etiket masa ekranında; panoda kişi zaten
  "görünmüyor" + `lost` bildirimiyle görünür. 130/130 test + tarayıcı uçtan uca.

#### 2.14 ✅ SUNUCUDAN_ISTENENLER.md + Faz 2 teslimi
- Netleştirilmiş §9 API listesi (Muhittin'e). Ekran görüntüleri + tasarım gerekçe notu.
- **Kabul ölçütü (Faz 2 tamamı):** akış mock ile uçtan uca oynanabilir; ekran görüntüleri + not + `SUNUCUDAN_ISTENENLER.md` teslim edildi.
- **Yapıldı (30.09.2026):** `SUNUCUDAN_ISTENENLER.md` (mock'un gerçek davranışından; kişi≠kart
  ilkesi, her ucun biçimi, Muhittin'e 4 açık soru). `docs/faz2/FAZ2_TESLIM.md` + 14 ekran
  görüntüsü — tek bir uçtan uca kabul senaryosundan (pano "Kişi ata" → CSV → yaklaştır →
  onay → geri al → kart değişimi → düzenle → kayıp kart → iade → stok). Kapanışta
  düzeltilenler: pano "Kişi ata" köprüsü bağlandı (Faz 1'de boştu), "5–10 cm" metni
  kaldırıldı + koruma testi, `/api/assign` 404 gövdesi. 136/136 test.

### ✅ Faz 3 — Kurulum / eşik ekranı (TAMAMLANDI 30.09.2026)
**Amaç:** Brief §4.3 + §8: teknik kişinin etkinlik öncesi eşiği ayarladığı, sinyalleri ve
kart sağlığını gördüğü ayrı "Kurulum" sayfası. Veri `/state` (SSE) + `/api/cards`; yeni
sunucu ucu gerekmez. dBm ve yön farkı burada gösterilebilir; **metre yine yok.** Grafik
bağımlılıksız SVG (Faz 1 ağ görünümüyle aynı yaklaşım).

**Şevval kararları (30.09.2026):** (1) Grafikte eşik üstü bölge **nötr ton** (yeşil değil —
eşik üstü ≠ birlikte; yeşil yalnız "birlikte"). (2) Kart sağlığında **paket hızı yok** (sözleşme
değişmez; son duyulma + pil). (3) Faz 3 **sorgulamadan bitirilir**; kararlar PLAN'a not düşülür,
Faz 4 başlamadan sorulur.

#### 3.1 ✅ Kurulum sayfası iskeleti + yönlendirme
- `#/kurulum` rotası, üst sekmede "Kurulum". Panodaki eşik rozeti buraya götürür (Faz 1.2 köprüsü).
- Düzen: üstte eşik, ortada grafik, altta çift tablosu; yanda/altta kart sağlığı. Tablet düzeni.
- Alıcı bağlı değil / sunucuya bağlanılamıyor bantları (Faz 1 bileşenleri yeniden kullanılır).
- **Doğrulama:** üç ekran arası geçiş; panodaki eşik rozeti Kurulum'u açar.
- **Yapıldı:** `#/kurulum` + sekme; eşik rozeti bağlandı; `HataBantlari` → `components/` (pano + kurulum ortak); iki sütun, ≤900 px tek sütun.

#### 3.2 ✅ Eşik kaydırıcısı
- -95…-35 dBm, anlık değer büyük yazıyla; bırakınca ~250 ms sonra `POST /control threshold`
  (sürüklerken gönderilmez). Sunucudan gelen `threshold` ile senkron; gönderiliyor/kaydedildi/hata durumu.
- Klavye ile ±1 dBm (erişilebilirlik).
- **Doğrulama:** kaydırınca tek istek gider, panodaki eşik değeri değişir; hata olursa eski değere döner.
- **Yapıldı:** `api/esik.js` (sınır, 250 ms gecikmeli tek gönderim, sunucu reddi `false` da hata) + testleri; `EsikAyari`: büyük değer, ±1, "şu an N çift eşik üstünde", kaydediliyor/kaydedildi/hata. Tarayıcıda: 5 tuş → 1 istek, sürükleme → 1 istek, ağ hatası ve 400'de eski değere dönüş.

#### 3.3 ✅ Çift tablosu
- Her duyulan çift (`signals`): iki kişi (renk + rol şekli + ad), `ab` ve `ba` ayrı, `value`, ölçüm sayısı `n`
  (seyrekse işaret), durum: **birlikte** / **başlıyor…** (above ∧ ¬together) / **bitiyor…** (¬above ∧ together) /
  eşik altı. Ara durumlar mevcut alanlardan türetilir (§9-7'ye gerek yok).
- Sakin sıralama (çift sırası zıplamaz); iki yön arasında büyük fark varsa "yön farkı" işareti.
- **Doğrulama:** mock'ta dört durum da görünür; `ab/ba` null ise "—".
- **Yapıldı:** `api/sinyal.js` (durum türetme, yön farkı ≥8 dB ⇄, seyrek n<5, küçük kart no solda — kişiler yer değişince ab/ba da çevrilir) + testleri; ortak `components/KisiRozeti` (renk + rol şekli + ad + kart no). Tarayıcıda dört durum görüldü (1×: birlikte/başlıyor; 10×: bitiyor/eşik altı), sıra hiç bozulmadı.

#### 3.4 ✅ Canlı sinyal grafiği
- `history` (son 90 sn): her çift bir çizgi (iki kişinin rengi), eşik yatay kesikli çizgi, eşik üstü
  bölge hafif **nötr** tonlu (yeşil değil), çizgi sonunda doğrudan etiket ("3 · 4"), üzerine gelince değer. Eşik kaydırılırken
  çizgi anında yer değiştirir. Çok çift varsa en güçlü N çift + "tümü" seçeneği.
- **Doğrulama:** grafik canlı akar, eşik çizgisi kaydırıcıyla oynar, hover değeri doğru.
- **Yapıldı:** `api/grafik.js` (seri seçimi, sabit eksen -95…-35, etiket çakışma önleme, anlık değerler) + testleri; `SinyalGrafigi` bağımlılıksız SVG, kabın gerçek px genişliğinde (ResizeObserver) çizilir — yazılar her ekranda okunur; iki renkli çizgi (iki kişi), nötr eşik bölgesi, "3 · 4" uç etiketleri, çapraz çizgi + ipucu; varsayılan en güçlü 6 çift + "Tümünü göster". Kaydırıcının taslak değeri ekran düzeyine taşındı: eşik çizgisi sürüklerken anında oynar.

#### 3.5 ✅ Perspektif (kişi seçimi)
- Bir kişi seçilince grafik ve tablo yalnız onun çiftlerini gösterir ("perspektif" düğmeleri / kişi seçici).
- **Doğrulama:** seçim yalnız ilgili çiftleri bırakır; temizleyince hepsi döner.
- **Yapıldı:** `PerspektifSecici` (şu an çifti duyulan kişiler) + tablodaki kişi adına tıklama; grafik ve tablo birlikte süzülür, başlık sayısı süzülmüş sayıyı gösterir.

#### 3.6 ✅ Kalibrasyon sihirbazı
- Çift seç (tablodan) → 1) iki kart yüz yüze → "Kaydet" (10 sn ortanca) → 2) sırt sırta ya da 2–3 adım
  uzakta → "Kaydet" → 3) "Eşiği ortaya koy": ikisinin ortası önerilir, onayla → 3.2'deki gönderim.
- Görsel anlatım: iki insan simgesi yüz yüze / sırt sırta (SVG, gömülü).
- Mock'a yalnız demo için "çifti yüz yüze / sırt sırta tut" ucu (`/api/yaklastir` gibi, gerçek sunucuda yok).
- **Doğrulama:** mock'ta iki ölçüm alınır, önerilen eşik ortada, onaylanınca eşik değişir.
- **Yapıldı:** `api/kalibrasyon.js` (ortadaki öneri, fark <6 dB ve ters ölçüm uyarısı, 10 sn geri sayım) + testleri; `KalibrasyonSihirbazi` + gömülü SVG simgeler (yüz yüze / sırt sırta, mesafe ölçüsü yok); ölçek üzerinde sırt sırta / yüz yüze / öneri / şu an işaretleri; onay doğrudan eşik gönderir. Mock: yalnız demo için `POST /api/demo/tut {a,b,mod}` (istek işleyicide rnd() yok). `api/http.js` ortak JSON katmanı (MasaApi + yeni KurulumApi). Tarayıcıda: -53 / -79 → öneri -66 → sunucu eşiği -66.

#### 3.7 ✅ Kart sağlığı tablosu
- Her kart: en son duyulma, pil, "sorunlu" etiketi (duyulmuyor / pil düşük); paket hızı yok (karar 2);
  atanmışsa kişi adı. Sorunlular üstte, gerisi numaraya göre.
- **Doğrulama:** kayıp kart senaryosunda kart "sorunlu" olur, düzelince kalkar.
- **Yapıldı:** `api/kartSagligi.js` (kayıp ≥60 sn — masadaki ölçütle aynı sabit; görünmüyor >30 sn; pil <%20) + testleri; `KartSagligi` (/api/cards 3 sn yoklama, kişi /state'ten kart no ile; sorunlular üstte; durum sütunu dar ekranda da görünür). Mock: 23'ün katı kartların pili zayıf (demo). `DUSUK_PIL` tek kaynak (Faz 2 şeridi de kullanır). Tarayıcıda: pil düşük üstte, kayıp kart üste çıkıp düzelince kalktı.

#### 3.8 ✅ Faz 3 teslimi
- `SUNUCUDAN_ISTENENLER.md` güncellemesi (3.6 demo ucu yalnız mock), ekran görüntüleri,
  `docs/faz3/FAZ3_TESLIM.md`.
- **Kabul ölçütü (Faz 3 tamamı):** eşik kaydırıcı + grafik + tablo + sihirbaz + kart sağlığı mock ile uçtan
  uca çalışır; §8 maddelerinin hepsi karşılanır; not + ekran görüntüleri teslim edildi.
- **Yapıldı:** `docs/faz3/FAZ3_TESLIM.md` + 10 ekran görüntüsü (tek kabul senaryosundan; 1× sinyal, 10× kayıp kart); `SUNUCUDAN_ISTENENLER.md` §5 (Kurulum: yeni uç gerekmez, `pending` gerekmez, paket hızı yok, Muhittin'e soru 5). Faz 2 kabul senaryosu yeniden koşuldu — gerileme yok. Kapanışta: çift tablosunda durum sütunu öne (telefonda kaydırmadan görünür), kart sağlığında kesilen hücre yok, yan sütun 3:2. 160/160 test.

### 🟡 Faz 4 — Kişi detay paneli (derin) + etkinlik sonrası rapor (başladı 30.09.2026)
**Amaç:** Brief §4.4 (rapor), §7 (kişi ayrıntı paneli), §9-6/§9-9. Şevval talimatı: **sorgulamadan
bitir, bitince haber ver.** Kararlar PLAN'a not düşülür.

**Ana karar:** Rapor `/state`'ten değil **görüşme kayıtlarından** (`/api/sessions`, kişi bazlı) ve kayıt
defterinden (`/api/people`) üretilir — kartı iade edilip ayrılanlar da raporda kalır (Faz 2 sözü).
`start/end` etkinlik saniyesi (`/state.elapsed` ile aynı ölçek), `a/b` = `kisiId`, sürmekte olan
görüşmede `end: null`. Saat gösterimi: etkinlik başlangıcı = şimdiki saat − `elapsed`.

#### 4.1 ⬜ Mock: `GET /api/sessions`
- Birlikte başlayınca kayıt açılır, bitince (ya da kart iade/değişiminde) kapanır; kişi bazlı
  (kart değişse de aynı kişi), atanmamış kartın kayıtları kişi atanınca ona geçer; sıfırla temizler.
- **Doğrulama:** mock testi — kayıt açılır/kapanır, iade sonrası kalır, çift toplamı kenar süresiyle tutarlı.

#### 4.2 ⬜ api: oturum/rapor yardımcıları + RaporApi
- `RaporApi` (people + sessions, ortak http katmanı). Saf fonksiyonlar: oturum süresi, saat yazısı,
  kişi toplamları, çift toplamları, girişimci → ulaştığı yatırımcılar, en uzun görüşmeler.
- **Doğrulama:** birim testleri (ayrılan kişi dahil, sürmekte olan görüşme dahil).

#### 4.3 ⬜ Kişi ayrıntı paneli (derin)
- Faz 1 panelinin altına **görüşme zaman çizelgesi** (bugün, zaman ekseninde çubuklar, karşı kişi etiketi,
  sürmekte olan açık uçlu), **kart bilgisi** (pil vb.) ve **"Kartı değiştir" / "Kartı iade al" kısayolları**
  → masa ekranı o kişi/kart hazır açılır.
- **Doğrulama:** panelde çizelge görünür; kısayollar masayı doğru adımda açar.

#### 4.4 ⬜ Rapor sayfası
- `#/rapor`: etkinlik başlığı + özet sayılar; kişi tablosu (toplam süre, kaç kişi, kaç karşı rol,
  ayrıldı/kartta); girişimci → ulaştığı yatırımcılar (hiç ulaşamayanlar vurgulu); en uzun görüşmeler;
  kim kimle toplam. Yazdırma/PDF dostu (`@media print`, "Yazdır / PDF" düğmesi).
- **Doğrulama:** ayrılan kişi raporda; sayılar oturumlarla tutarlı; yazdırma görünümü temiz.

#### 4.5 ⬜ CSV dışa aktarma
- Rapordan iki dosya: kişiler, görüşmeler. Türkçe Excel uyumlu (UTF-8 BOM, `;`). Tarayıcıda üretilir
  (sunucu beklenmez); `GET /api/report.csv` SUNUCUDAN_ISTENENLER'de isteğe bağlı kalır.
- **Doğrulama:** indirilen dosya Excel ayrıştırmasıyla doğru sütunları verir; Türkçe harfler bozulmaz.

#### 4.6 ⬜ Faz 4 teslimi
- `SUNUCUDAN_ISTENENLER.md` güncellemesi (sessions biçimi), ekran görüntüleri, `docs/faz4/FAZ4_TESLIM.md`.
- **Kabul ölçütü:** panel çizelgesi + kısayollar + rapor + yazdırma + CSV mock ile uçtan uca; not + görüntüler.

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

**3.4 sırasında fark edilen (onay bekliyor):**
- [ ] **Kişi paleti renk ayrımı doğrulamasından geçmiyor** (dataviz doğrulayıcısı, OKLab, açık
      zemin `#fffdf8`): mercan `#bf4545` ↔ turuncu `#c25022` normal görüşte bile ΔE 4.8 (<15);
      hardal ↔ turuncu renk körlüğünde ΔE 1.7; petrol ve gri düşük canlılık. Faz 1'deki test
      CIELAB ölçütüyle geçiyordu. Etkisi sınırlı: 7 renk 25+ kişiye dağıldığı için kimlik her
      ekranda zaten renk + şekil + ad (grafikte "3 · 4" etiketi) ile veriliyor. Öneri: Faz 5
      (tema) ile birlikte paleti doğrulayıcıdan geçen tonlarla yeniden adımlamak.

**2.10 sırasında fark edilen, kapsam dışı bırakılanlar (onay bekliyor):**
- [x] ~~**Masa ekranlarında renk dönüşümü yok**~~ → düzeltildi (Faz 2 bitirme talimatı):
      `masaApi.js` kişi rengini `sunucuRengi` ile panodakiyle aynı açık palete çevirir;
      masada yeşil yok, kişi her ekranda aynı renk.
- [ ] **Atama geçmişi mock'ta yok:** 2.1'de "zaman damgalı geçmişe yazılır" denmişti ama
      yazılmıyor. Geri al şimdilik masanın kendi son atamasıyla (istemci) çalışır.
      Sunucu tarafı geçmiş → 2.14 `SUNUCUDAN_ISTENENLER.md`.
- [x] ~~**"Ayrıldı" ayrı durum değil**~~ → 2.12'de `ayrildi` alanı eklendi (onaylı).
      `SUNUCUDAN_ISTENENLER.md`'ye (2.14) yazılacak: `/api/people` `ayrildi`,
      `/api/unassign` `ayrildi` bayrağı, `/api/people/import` yanıt biçimi.
- [x] ~~**Kenarlar kart no ile anahtarlı**~~ → 2.11'de düzeltildi (kenarlar kişiye bağlı).
- [ ] **Kart değişiminde "Geri al"** yeni kartı boşa çıkarır, eski kartı geri vermez;
      kişi kartsız kalır (ekranda bu söylenir). Eski kartı geri vermek istenirse ayrıca karar.
- [ ] **Bildirim akışı yinelenen React anahtarı** (`t-kind`): aynı tikte iki anlaşma aynı
      zaman damgasını alıyor (hızlandırılmış mock'ta sık). Faz 1'den kalma, 2.10 öncesi de var.
