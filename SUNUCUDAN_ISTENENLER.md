# Sunucudan İstenenler — Karşılama Masası (brief §9)

> Muhittin'e · Hazırlayan: Şevval (arayüz) · 30.09.2026 · Faz 2 çıktısı, Faz 3 (Kurulum) eklendi
>
> Arayüz bu uçlarla **mock sunucuya karşı** uçtan uca çalışıyor
> (`mock-server/mock.js` — davranışın çalışan referansı). Gerçek sunucu aynı
> sözleşmeyi verdiğinde arayüzde değişecek tek şey `src/api/masaApi.js` içindeki
> adres. Aşağıdaki biçimler mock'un bugün döndürdüğünün aynısıdır.

## Genel

- Tüm uçlar panoyla **aynı kaynaktan** (aynı host:port) verilir; CORS gerekmez.
- Gövdeler JSON (`Content-Type: application/json`); yalnız CSV içe aktarma ham metindir.
- Hata: 4xx + `{"ok": false, "hata": "…"}` (arayüz durum koduna bakar, metni göstermez).
- `rol` değerleri: `investor` | `founder` | `guest`. `yildiz` 0–5, yatırımcı değilse 0.
- `renk`: sunucunun bugünkü paletinden atanır ve **kişi için hiç değişmez**
  (arayüz açık temaya kendisi çevirir).
- Kart numaraları metin: `"14"`. 100 ve üstü dinleyici cihazdır, kişiye atanmaz.

## Temel kavram: Kişi ≠ Kart

Kişi (katılımcı) kalıcı bir kayıttır; kart fiziksel cihazdır. Bir kişiye bir
anda en fazla bir kart atanır. **Süreler ve "kim kimle ne kadar" kenarları kişiye
yazılır, karta değil:**
- Kart değişince (pil bitti, yeni kart) kişinin süreleri yeni kartta **birleşir**.
- İade edilen kart başka birine verilirse eski sahibin süreleri **devredilmez**.
- Kartı iade edilen (ayrılan) kişinin süreleri **silinmez**; yeni kart alırsa geri gelir,
  rapor (Faz 4) bunları kullanır.

`/state` sözleşmesi (brief §5) **değişmiyor**: `people[].id` ve `edges[].a/b` yine
güncel kart numarasıdır. Sunucu kişi bazlı tuttuğu kenarları o anki kartlara
çevirerek yayınlar; kartı olmayan kişinin kenarları `/state`'te görünmez.

## 1. Kişi kayıt defteri

### `GET /api/people` → `Kisi[]`

```json
{
  "kisiId": "k12", "ad": "Ayşe Demir", "rol": "investor", "kurum": "Atlas Ventures",
  "yildiz": 4, "not": "", "renk": "#3987e5", "atananKart": "14", "ayrildi": false
}
```

| Alan | Anlamı |
|---|---|
| `kisiId` | Kalıcı kimlik (kart değişse de aynı) |
| `atananKart` | Şu anki kart ya da `null` |
| `ayrildi` | Kart iadesi yapıldı mı. `atananKart: null` + `ayrildi: false` = **"kart bekliyor"**; `ayrildi: true` = **"ayrıldı"** |

### `POST /api/people` `{ad, rol, kurum?, yildiz?, not?}` → `Kisi`
Kartsız oluşur (`atananKart: null`, `ayrildi: false`), renk o anda atanır. `ad` boşsa 400.

### `PATCH /api/people/{kisiId}` `{ad?, rol?, kurum?, yildiz?, not?}` → `Kisi`
- Yalnız gönderilen alanlar değişir. **`renk` ve `kisiId` değiştirilemez** (gönderilirse yok sayılır).
- Geçersiz `rol` ve boş `ad` yok sayılır; `yildiz` 0–5'e kırpılır, rol yatırımcı değilse 0.
- Kişinin kartı varsa `/state`'teki adı/rolü/yıldızı hemen güncellenir.
- Olmayan kişi: 404.

### `DELETE /api/people/{kisiId}` → `{ok: true}`
Kartı varsa önce iade edilir. (Arayüz şu an kullanmıyor; kayıt defteri bütünlüğü için.)

### `POST /api/people/import` (gövde: ham CSV, `Content-Type: text/csv; charset=utf-8`)
→ `{"eklenen": 18, "atlanan": [{"satir": 6, "sebep": "rol anlaşılamadı: \"Konuşmacı\""}]}`

- Sütunlar: **ad, soyad, rol, kurum, yıldız** (brief §6.2). Kişinin `ad` alanı = "ad soyad".
- İlk satır başlıksa (ad/soyad/rol/kurum/yıldız; Türkçe harfli ya da harfsiz) sütunlar
  ada göre eşlenir, değilse bu sırayla okunur.
- Ayraç `;` (Türkçe Excel), `,` ya da sekme — ilk satırdan anlaşılır. Tırnaklı alan
  (`"Veri; Köprüsü A.Ş."`, `""` kaçışı) desteklenir. Baştaki UTF-8 BOM atılır.
- Rol: `Yatırımcı/Girişimci/Misafir` (büyük-küçük, ı/i farkı gözetmeden) ya da `investor/founder/guest`.
- Atlanır (satır numarasıyla bildirilir): boş ad, anlaşılmayan rol, **aynı ad + kurum
  zaten kayıtlı**. Boş satırlar sessizce geçilir.
- Eklenenler kartsız ve `ayrildi: false` → masada "kart bekliyor".
- Boş gövde: 400.
- Not: dosya kodlamasını (UTF-8 / Windows-1254) **arayüz** çözer; sunucuya her zaman UTF-8 gelir.

## 2. Atama / iade / değişim

### `POST /api/assign {kisiId, kart}` → `{ok: true}`
- Kart başka birindeyse o atama kapanır (masa önce "Bu kart Ali Kaya'da. Geri alındı mı?"
  diye sorar). O kişi **ayrılmış sayılmaz** (`ayrildi` değişmez).
- Kişinin başka kartı varsa bırakılır (**kart değişimi**); süreler yeni kartta birleşir.
- Kişinin `ayrildi` alanı `false` olur. Kart "boştaki kartlar"dan çıkar.
- Kişi panoda hemen görünür (yeniden başlatma yok).
- Olmayan kişi: 404 `{ok: false}`.

### `POST /api/unassign {kart, ayrildi?}` → `{ok: true}`
- `ayrildi` varsayılan **`true`** = kart iadesi (brief §6.3: kişi "ayrıldı" olur).
- Arayüzün **"Geri al"** düğmesi (son birkaç dakikadaki yanlış atamayı düzeltme)
  `ayrildi: false` gönderir: kişi ayrılmadı, hâlâ kart bekliyor.
- Kart panodan düşer, süreler silinmez. Kart masaya döner: açık kaldığı sürece
  `/api/cards`'ta atanmamış (boştaki) kart olarak görünür.
- **Açık görüşmedeki kart iade edilebilir** (görüşmeler ~15 sn geç bittiği için masaya
  gelen kişi çoğu zaman hâlâ "birlikte"dir). Sunucu bu durumda o çifti kapatmalı ve
  eşini serbest bırakmalı. (Mock'ta bu durum sunucuyu çökertiyordu, düzeltildi.)

### İstenen: zaman damgalı atama geçmişi
Brief §9-2'deki "zaman damgalı atama geçmişi" mock'ta yok; arayüz "Geri al"ı şimdilik
masanın kendi hafızasıyla yapıyor (sayfa yenilenirse unutulur). Rapor ve denetim için
her atama/iade/değişimin `{zaman, kisiId, kart, islem}` kaydı tutulmalı. Önerilen:
`GET /api/assignments` → `[{t, kisiId, kart, islem: "ata"|"iade"|"geri_al"|"degisim"}]`.

## 3. Kartlar — `GET /api/cards`

```json
[{"kart": "14", "rssiAlici": -71.4, "seenAgo": 0.6, "atanan": "k12", "pil": 82}]
```

| Alan | Birim / anlamı | Arayüz nerede kullanır |
|---|---|---|
| `rssiAlici` | dBm, alıcının kartı duyduğu güç | "Yaklaştır ve tanı": tek kart > −55 → bulundu, iki+ → "birini uzaklaştırın" |
| `seenAgo` | **saniye** | ≤8 sn "açık"; atanmış kartta ≥60 sn → **"Kartı kontrol et"** (brief `lost` ile aynı ölçüt) |
| `atanan` | `kisiId` ya da `null` | "zaten atanmış" uyarısı; `null` + açık → **boştaki kartlar** şeridi |
| `pil` | % (kart paketindeki `batt`) | Kontrol adımı; boştaki kartta %20 altı ⚠ |

- Liste, alıcının duyduğu **tüm** kartları içermeli: atanmışlar, masadaki yedekler
  (atanmamış), iade edilip masaya dönenler. Arayüz 1–3 sn'de bir yoklar.
- `POST /api/yaklastir` **yalnız mock'ta** var (donanım olmadan yaklaştırmayı taklit
  eden demo düğmesi). Gerçek sunucuda gerekmez.

## 4. Açık sorular (Muhittin)

1. **Masadaki yedekler panoda "Kart N" olarak görünmemeli.** Brief §5.1'e göre sunucu
   duyduğu atanmamış kartı `people`'a "Kart N" diye ekliyor; masada 20 yedek kart
   açık durursa panoya 20 hayalet kişi düşer. Mock'ta yedekler `/state`'te yok. Öneri:
   atanmamış kart `people`'a yalnız bir görüşmeye girdiğinde (ya da masadan uzaklaşınca)
   eklensin — ya da `people[].atanmamis: true` gelsin, pano karar versin.
2. **Yedek ile kayıtsız dolaşan kart ayırt edilebilir mi?** İkisi de "atanmamış ve açık".
   Masadaki şerit şu an ikisini de "boştaki kart" gösteriyor.
3. **Atama geçmişi** (yukarıda) hangi biçimde tutulacak?
4. `DELETE /api/people/{kisiId}` bir kişinin raporlanmış sürelerini de silsin mi?
   (Arayüz silmeyi sunmuyor; iade yeterli.)

## 5. Kurulum / eşik ekranı (Faz 3) — yeni uç gerekmiyor

Kurulum ekranı bugünkü sözleşmeyle çalışıyor; yalnız aşağıdakilerin **aynen** korunması yeterli:

| Alan / uç | Kullanım |
|---|---|
| `/state.threshold` | Kaydırıcının ve grafikteki eşik çizgisinin değeri |
| `/state.signals[]` (`a, b, ab, ba, value, n, above, together`) | Çift tablosu. `value` = **son 10 sn ortancası** olmalı: kalibrasyon "10 sn tut → o anki `value`" ile ölçüyor |
| `/state.history` (`"a-b": [[saniyeÖnce, dBm], …]`, en eski başta) + `chartSeconds` | Canlı grafik. Anahtar `"küçükNo-büyükNo"` |
| `POST /control {"cmd":"threshold","value":-68}` | Kaydırıcı (bırakınca ~250 ms sonra tek istek) ve kalibrasyon onayı. 2xx dışı yanıt hata sayılır, ekran eski değere döner |
| `GET /api/cards` (`seenAgo`, `pil`, `atanan`) | Kart sağlığı: ≥60 sn "duyulmuyor", >30 sn "görünmüyor", pil <%20 "pil düşük" |

- **"Başlıyor… / bitiyor…" için §9-7'deki `pending` alanı gerekmiyor:** `above` ile `together`
  farkından türetiliyor (above ∧ ¬together = başlıyor, ¬above ∧ together = bitiyor).
- **Paket hızı istenmiyor** (Şevval kararı): kart sağlığı son duyulma + pil ile yetiniyor.
- `POST /api/demo/tut {a, b, mod}` **yalnız mock'ta** (kalibrasyonu donanımsız denemek için);
  gerçek sunucuda gerekmez.

**Soru 5 (Muhittin):** Kalibrasyon genelde masadaki **yedek (atanmamış) kartlarla** yapılır.
Bu kartların çiftleri `signals` ve `history`'de görünüyor mu? Görünmüyorsa kalibrasyon
için geçici olarak (ör. Kurulum açıkken) dahil edilmeleri gerekir. Mock'ta şu an yalnız
panodaki kartların çiftleri var.

## 6. Faz 4'te gerekecekler (brief §9, biçim brief'teki gibi)

| # | Uç | Ne için |
|---|---|---|
| 6 | `GET /api/sessions` → `[{a, b, start, end}]` | Görüşme zaman çizelgesi, rapor (Faz 4). `a/b` = `kisiId` olmalı (kart değil) |
| 8 | `GET/PATCH /api/event` | Etkinlik bilgisi, anlaşma/yalnız kalma süreleri (Faz 4 ya da sonrası; Faz 3'te gerekmedi) |
| 9 | `GET /api/report.csv` | Rapor dışa aktarma (Faz 4); süreler kişi bazlı |
