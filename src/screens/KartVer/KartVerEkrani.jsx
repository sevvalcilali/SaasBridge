// Karşılama masası — kart atama ekranı (brief §6). Dokunmatik-ayakta kullanım:
// büyük hedefler, az yazı. Sihirbaz adımları 2.5–2.9'da doldurulur; bu iskelet
// yalnız düzeni ve adım göstergesini kurar.
import './KartVerEkrani.css'

const ADIMLAR = [
  { no: 1, ad: 'Kişi' },
  { no: 2, ad: 'Kart' },
  { no: 3, ad: 'Onay' },
]

export default function KartVerEkrani() {
  return (
    <main className="kartver">
      <header className="kartver-bas">
        <h1>Kart Ver</h1>
        <p className="kartver-alt">Karşılama masası — gelen kişiye kart verin</p>
      </header>

      <ol className="kartver-adimlar" aria-label="Adımlar">
        {ADIMLAR.map((a, i) => (
          <li key={a.no} className={`kartver-adim ${i === 0 ? 'kartver-adim--etkin' : ''}`}>
            <span className="kartver-adim-no">{a.no}</span>
            <span className="kartver-adim-ad">{a.ad}</span>
          </li>
        ))}
      </ol>

      <section className="kartver-govde" data-test="kartver-govde">
        <p className="kartver-iskele">Adım içerikleri sıradaki adımlarda gelecek.</p>
      </section>
    </main>
  )
}
