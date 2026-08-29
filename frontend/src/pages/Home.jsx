import { Link } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import TermCard from '../components/TermCard'
import { TERMS, CATEGORIES, t, filterBySafeMode, termsByCategory } from '../lib/dict'
import { usePrefs, ui } from '../context/PrefsContext'

// 首页展示的陷阱词：机翻会给出完全误导性答案的那些
const TRAPS = ['kusa', 'taitai', 'jirai', 'gan', 'dao', 'tafang', 'oshi', 'dotan-kyohi']

export default function Home() {
  const { lang, safeMode } = usePrefs()
  const traps = filterBySafeMode(
    TRAPS.map((id) => TERMS.find((x) => x.id === id)).filter(Boolean),
    safeMode
  )

  return (
    <>
      <section className="hero">
        <div className="ruby">Translator&rsquo;s Note</div>
        <h1>
          TL Note<em>.</em>
        </h1>
        <p className="hero-lede">{ui('tagline', lang)}</p>
        <SearchBar big />
        <Link className="decode-cta" to="/decode">
          {ui('decodeCta', lang)} →
        </Link>
      </section>

      <section className="section">
        <h2 className="sec-h">{ui('trending', lang)}</h2>
        <div className="cardgrid">
          {traps.map((x) => (
            <TermCard key={x.id} term={x} />
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="sec-h">{ui('browse', lang)}</h2>
        <div className="catgrid">
          {CATEGORIES.map((c) => {
            const n = filterBySafeMode(termsByCategory(c.id), safeMode).length
            return (
              <Link key={c.id} className="catcard" to={'/explore/' + c.id}>
                <div className="cat-name">{t(c.label, lang)}</div>
                <div className="cat-blurb">{t(c.blurb, lang)}</div>
                <div className="cat-n">
                  {n} {ui('terms', lang)}
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </>
  )
}
