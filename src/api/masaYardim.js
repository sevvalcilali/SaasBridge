// Karşılama masası saf yardımcıları. Ekran bileşenleri bunları çağırır.

const tr = (s) => (s ?? '').toLocaleLowerCase('tr')

// Kayıtlı katılımcılarda ad/kurum araması (Türkçe büyük-küçük harf duyarsız).
export function katilimciAra(liste, arama) {
  const q = tr(arama).trim()
  if (!q) return liste
  return liste.filter((k) => tr(`${k.ad} ${k.kurum}`).includes(q))
}

// Yeni kişi formu geçerli mi: ad zorunlu, rol tanımlı olmalı.
export function formGecerli(form) {
  return Boolean(form?.ad?.trim()) && ['investor', 'founder', 'guest'].includes(form?.rol)
}
