// Durum nesnesinden türetilen küçük kararlar. Ekran bileşenleri bu
// yardımcıları çağırır, JSX içinde eşik/karşılaştırma yapmaz.

// brief §5.1: receiverAge alıcıdan son satırın kaç SANİYE önce geldiği;
// >5 ise sorun var, null ise hiç veri gelmemiş.
export function aliciBagli(durum) {
  const yas = durum?.receiverAge
  return yas != null && yas <= 5
}
