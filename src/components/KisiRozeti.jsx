// Kişi kimliği tek parçada (brief §10: kimlik asla yalnız renkle verilmez):
// renk + rol şekli (○ yatırımcı, □ girişimci, ◇ misafir) + ad + kart no.
// Girişimcide kurum öne çıkar (panodaki gibi). Kurulum ekranında ortak kullanılır.
import './KisiRozeti.css'

const ROL_ADI = { investor: 'Yatırımcı', founder: 'Girişimci', guest: 'Misafir' }

export default function KisiRozeti({ kisi, kartNo = true }) {
  const ad = kisi.role === 'founder' && kisi.org ? kisi.org : kisi.name
  // Kayıtsız kart zaten "Kart 14" adını taşır; numarayı ikinci kez yazma.
  const noGoster = kartNo && ad !== `Kart ${kisi.id}`
  const baslik = [kisi.name, kisi.org, ROL_ADI[kisi.role], `Kart ${kisi.id}`].filter(Boolean).join(' · ')
  return (
    <span className="kisi-rozeti" title={baslik}>
      <span className="kisi-rozeti-renk" style={kisi.color ? { background: kisi.color } : undefined} aria-hidden="true" />
      {kisi.role && <span className={`kisi-rozeti-rol kisi-rozeti-rol--${kisi.role}`} aria-hidden="true" />}
      <span className="kisi-rozeti-ad">{ad}</span>
      {noGoster && <>{' '}<span className="kisi-rozeti-kart sayi">{kisi.id}</span></>}
    </span>
  )
}
