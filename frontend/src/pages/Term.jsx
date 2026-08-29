import { useParams, Link } from 'react-router-dom'
import { getTerm, getCategory, t } from '../lib/dict'
import { usePrefs, ui } from '../context/PrefsContext'
import MachineVsReal from '../components/MachineVsReal'
import CrossCulture from '../components/CrossCulture'
import RelatedTerms from '../components/RelatedTerms'

export default function Term() {
  const { id } = useParams()
  const { lang, level } = usePrefs()
  const term = getTerm(id)

  if (!term) {
    return (
      <div className="empty">
        <p>No entry with id “{id}”.</p>
        <Link to="/">← Home</Link>
      </div>
    )
  }

  const cat = getCategory(term.category)
  const explanation = t(term.explanation?.[level], lang)

  return (
    <article className="entry">
      <div className="entry-main">
        <div className="headword">
          <div className="hw-read">{term.reading}</div>
          <h1 className="hw">{term.term}</h1>
        </div>

        <div className="meta">
          {cat && (
            <Link className="chip cat" to={'/explore/' + cat.id}>
              {t(cat.label, lang)}
            </Link>
          )}
          <span className="chip">source: {term.source_language}</span>
          {term.aliases?.length > 0 && (
            <span className="chip">also: {term.aliases.slice(0, 4).join(' · ')}</span>
          )}
          <span className={'chip sens ' + (term.sensitivity || 'safe')}>
            {term.sensitivity || 'safe'}
          </span>
          {term.status === 'ai-draft' && <span className="chip draft">{ui('aiDraft', lang)}</span>}
        </div>

        <MachineVsReal term={term} />

        <section className="block">
          <h3 className="block-h">{ui('explanation', lang)}</h3>
          <p className="prose">{explanation}</p>
        </section>

        {term.example && (
          <section className="block">
            <h3 className="block-h">{ui('example', lang)}</h3>
            <blockquote className="quote">
              <div className="q-text">{term.example.text}</div>
              <div className="q-tr">{t(term.example.translation, lang)}</div>
              <div className="q-src">{term.example.source}</div>
            </blockquote>
          </section>
        )}
      </div>

      <aside className="entry-side">
        <CrossCulture rows={term.cross_culture} />
        <RelatedTerms ids={term.related} />
        <section className="block">
          <h3 className="block-h">{ui('sources', lang)}</h3>
          <p className="dim small">{term.first_seen}</p>
        </section>
      </aside>
    </article>
  )
}
