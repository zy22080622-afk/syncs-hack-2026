import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePrefs, ui } from '../context/PrefsContext'

export default function SearchBar({ big = false, initial = '' }) {
  const [q, setQ] = useState(initial)
  const nav = useNavigate()
  const { lang } = usePrefs()

  function submit(e) {
    e.preventDefault()
    const v = q.trim()
    if (v) nav('/search?q=' + encodeURIComponent(v))
  }

  return (
    <form className={'searchbar' + (big ? ' big' : '')} onSubmit={submit} role="search">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={ui('searchPlaceholder', lang)}
        aria-label="Search terms"
        autoComplete="off"
      />
      <button type="submit">→</button>
    </form>
  )
}
