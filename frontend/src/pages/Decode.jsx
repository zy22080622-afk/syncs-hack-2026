import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { buildIndex, decodeLocal, knownSurfaces, t } from '../lib/dict'
import { usePrefs, ui } from '../context/PrefsContext'
import { decodeUnknown } from '../lib/api'

const SAMPLE =
  '今天补番补到凌晨，这集神回啊，最后十分钟直接给我发刀，破防了。谁家太太接一下这个梗我氪金。'

export default function Decode() {
  const { lang, level } = usePrefs()
  const [text, setText] = useState(SAMPLE)
  const [decoded, setDecoded] = useState(null)
  const [ai, setAi] = useState([])
  const [aiState, setAiState] = useState('idle') // idle | loading | error

  // 索引只建一次
  const index = useMemo(() => buildIndex(), [])

  function run() {
    setAi([])
    setAiState('idle')
    setDecoded(decodeLocal(text, index))
  }

  async function askAI() {
    setAiState('loading')
    try {
      const res = await decodeUnknown(text, knownSurfaces())
      setAi(res.terms || [])
      setAiState('idle')
    } catch {
      setAiState('error')
    }
  }

  return (
    <section className="section decode-page">
      <h1 className="page-h">{ui('decodeTitle', lang)}</h1>
      <p className="page-lede">{ui('decodeLead', lang)}</p>

      <textarea
        className="decode-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        aria-label="Text to decode"
      />

      <div className="row-actions">
        <button type="button" className="primary" onClick={run}>
          {ui('decodeButton', lang)}
        </button>
        <button type="button" className="ghost" onClick={askAI} disabled={aiState === 'loading'}>
          {aiState === 'loading' ? '…' : ui('askAI', lang)}
        </button>
      </div>

      {aiState === 'error' && (
        <p className="dim small">
          The AI service isn&rsquo;t reachable. Local decoding above still works completely offline.
        </p>
      )}

      {decoded && (
        <>
          <div className="decoded">
            {decoded.pieces.map((p, i) =>
              p.type === 'hit' ? (
                <Link key={i} className="tk" to={'/term/' + p.id}>
                  {p.text}
                  <sup>{p.n}</sup>
                </Link>
              ) : (
                <span key={i}>{p.text}</span>
              )
            )}
          </div>

          <div className="tlnotes">
            {decoded.notes.map((n) => (
              <div className="tln" key={n.n}>
                <b>{n.n}</b>
                <div>
                  <Link className="tln-term" to={'/term/' + n.id}>
                    {n.term.term}
                  </Link>{' '}
                  — {t(n.term.real_meaning, lang)}
                  <div className="dim small">{t(n.term.explanation?.[level], lang)}</div>
                </div>
              </div>
            ))}
            {decoded.notes.length === 0 && (
              <p className="dim">No known terms found in that text yet.</p>
            )}

            {ai.map((d, i) => (
              <div className="tln ai" key={'ai' + i}>
                <b>AI</b>
                <div>
                  <span className="tln-term">{d.term}</span> — {t(d.real_meaning, lang)}
                  <div className="dim small">{t(d.explanation?.simple, lang)}</div>
                  <div className="chip draft">{ui('aiDraft', lang)}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
