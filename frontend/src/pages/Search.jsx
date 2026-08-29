import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import TermCard from '../components/TermCard'
import { searchTerms } from '../lib/search'
import { filterBySafeMode, t } from '../lib/dict'
import { usePrefs, ui } from '../context/PrefsContext'
import { draftTerm } from '../lib/api'

export default function Search() {
  const [params] = useSearchParams()
  const q = params.get('q') || ''
  const { lang, safeMode } = usePrefs()
  const results = filterBySafeMode(searchTerms(q), safeMode)

  const [draft, setDraft] = useState(null)
  const [state, setState] = useState('idle') // idle | loading | error

  async function askAI() {
    setState('loading')
    setDraft(null)
    try {
      const d = await draftTerm(q)
      setDraft(d)
      setState('idle')
    } catch {
      setState('error')
    }
  }

  return (
    <section className="section">
      <SearchBar initial={q} />
      <h1 className="page-h">
        “{q}” <span className="dim small">— {results.length}</span>
      </h1>

      <div className="cardgrid">
        {results.map((x) => (
          <TermCard key={x.id} term={x} />
        ))}
      </div>

      {results.length === 0 && (
        <div className="empty">
          <p>
            {ui('noResults', lang)} <strong>{q}</strong>
          </p>
          <button type="button" className="primary" onClick={askAI} disabled={state === 'loading'}>
            {state === 'loading' ? '…' : ui('draftIt', lang)}
          </button>
          {state === 'error' && (
            <p className="dim small">
              The AI service isn&rsquo;t reachable right now. Everything already in the wiki still
              works.
            </p>
          )}
        </div>
      )}

      {draft && (
        <div className="draftbox">
          <div className="chip draft">{ui('aiDraft', lang)}</div>
          <div className="hw small-hw">{draft.term}</div>
          <div className="vs">
            <div className="vs-row bad">
              <div className="vs-lbl">{ui('machineSays', lang)}</div>
              <div className="vs-val struck">{draft.machine_translation}</div>
            </div>
            <div className="vs-row good">
              <div className="vs-lbl">{ui('actually', lang)}</div>
              <div className="vs-val">{t(draft.real_meaning, lang)}</div>
            </div>
          </div>
          <p className="prose">{t(draft.explanation?.simple, lang)}</p>
          <p className="dim small">
            Not saved to the wiki. A human reviews AI drafts before they become entries.
          </p>
        </div>
      )}
    </section>
  )
}
