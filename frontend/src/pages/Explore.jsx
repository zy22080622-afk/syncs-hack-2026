import { useParams, Link } from 'react-router-dom'
import { CATEGORIES, termsByCategory, filterBySafeMode, t, getCategory } from '../lib/dict'
import { usePrefs, ui } from '../context/PrefsContext'
import TermCard from '../components/TermCard'

export default function Explore() {
  const { cat } = useParams()
  const { lang, safeMode } = usePrefs()

  if (!cat) {
    return (
      <section className="section">
        <h1 className="page-h">{ui('browse', lang)}</h1>
        <div className="catgrid">
          {CATEGORIES.map((c) => (
            <Link key={c.id} className="catcard" to={'/explore/' + c.id}>
              <div className="cat-name">{t(c.label, lang)}</div>
              <div className="cat-blurb">{t(c.blurb, lang)}</div>
              <div className="cat-n">
                {filterBySafeMode(termsByCategory(c.id), safeMode).length} {ui('terms', lang)}
              </div>
            </Link>
          ))}
        </div>
      </section>
    )
  }

  const category = getCategory(cat)
  const list = filterBySafeMode(termsByCategory(cat), safeMode)

  return (
    <section className="section">
      <Link className="backlink" to="/explore">
        ← {ui('back', lang)}
      </Link>
      <h1 className="page-h">{category ? t(category.label, lang) : cat}</h1>
      {category && <p className="page-lede">{t(category.blurb, lang)}</p>}
      <div className="cardgrid">
        {list.map((x) => (
          <TermCard key={x.id} term={x} />
        ))}
      </div>
      {list.length === 0 && <p className="dim">Nothing here yet.</p>}
    </section>
  )
}
