import { Link } from 'react-router-dom'
import { t } from '../lib/dict'
import { usePrefs } from '../context/PrefsContext'

export default function TermCard({ term }) {
  const { lang } = usePrefs()
  if (!term) return null

  return (
    <Link className="termcard" to={'/term/' + term.id}>
      <div className="tc-word">{term.term}</div>
      <div className="tc-read">{term.reading}</div>
      <div className="tc-gt">{term.machine_translation}</div>
      <div className="tc-real">{t(term.real_meaning, lang)}</div>
    </Link>
  )
}
