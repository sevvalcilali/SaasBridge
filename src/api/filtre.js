// Kişi listesi arama + filtre mantığı. Ekran yalnız state tutar; süzme burada.

// UI'da gösterilecek filtre düğmeleri, sırasıyla.
export const FILTRELER = [
  { deger: 'tumu', etiket: 'Tümü' },
  { deger: 'investor', etiket: 'Yatırımcı' },
  { deger: 'founder', etiket: 'Girişimci' },
  { deger: 'talking', etiket: 'Birlikte' },
  { deger: 'idle', etiket: 'Boşta' },
  { deger: 'away', etiket: 'Görünmüyor' },
  { deger: 'gorusmemis', etiket: 'Hiç görüşmemiş' },
]

const tr = (s) => (s ?? '').toLocaleLowerCase('tr')

function filtreUyar(kisi, filtre) {
  switch (filtre) {
    case 'tumu': return true
    case 'investor':
    case 'founder':
    case 'guest': return kisi.role === filtre
    case 'talking':
    case 'idle':
    case 'away': return kisi.status === filtre
    // Hiç görüşmemiş: karşı rolle (yatırımcıyla) hiç görüşmemiş GİRİŞİMCİ (brief §7).
    case 'gorusmemis': return kisi.role === 'founder' && kisi.invPeers === 0
    default: return true
  }
}

export function filtreleKisiler(people, { arama = '', filtre = 'tumu' } = {}) {
  const q = tr(arama).trim()
  return people.filter((kisi) => {
    if (!filtreUyar(kisi, filtre)) return false
    if (!q) return true
    return tr(`${kisi.name} ${kisi.org} ${kisi.id}`).includes(q)
  })
}
