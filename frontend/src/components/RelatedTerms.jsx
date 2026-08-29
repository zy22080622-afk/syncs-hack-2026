import { Link } from 'react-router-dom'
import { getTerm } from '../lib/dict'
import { usePrefs, ui } from '../context/PrefsContext'

export default function RelatedTerms({ ids }) {
  const { lang } = usePrefs()
  const list = (ids || []).map(getTerm).filter(Boolean)
  if (!list.length) return null

  return (
    <section className="block">
      <h3 className="block-h">{ui('related', lang)}</h3>
      <div className="rel">
        {list.map((x) => (
          <Link key={x.id} to={'/term/' + x.id}>
            {x.term}
          </Link>
        ))}
      </div>
    </section>
  )
}
