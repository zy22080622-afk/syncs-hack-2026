import { NavLink } from 'react-router-dom'
import { usePrefs, ui } from '../context/PrefsContext'
import Switch from './Switch'

export default function Header() {
  const { lang, setLang, level, setLevel, safeMode, setSafeMode } = usePrefs()

  return (
    <header className="site-head">
      <NavLink to="/" className="logo" aria-label="TL Note home">
        TL Note<em>.</em>
      </NavLink>

      <nav className="nav">
        <NavLink to="/explore">Explore</NavLink>
        <NavLink to="/decode">Decode</NavLink>
        <NavLink to="/about">About</NavLink>
      </nav>

      <div className="head-controls">
        <Switch
          label="Output language"
          value={lang}
          onChange={setLang}
          options={[
            { value: 'en', label: 'EN' },
            { value: 'zh', label: '中文' },
            { value: 'ja', label: '日本語' },
          ]}
        />
        <Switch
          label="Explanation depth"
          value={level}
          onChange={setLevel}
          options={[
            { value: 'simple', label: ui('simple', lang) },
            { value: 'full', label: ui('full', lang) },
          ]}
        />
        <button
          type="button"
          className={'ghost' + (safeMode ? ' on' : '')}
          aria-pressed={safeMode}
          title={ui('safeModeHint', lang)}
          onClick={() => setSafeMode(!safeMode)}
        >
          {ui('safeMode', lang)}
        </button>
      </div>
    </header>
  )
}
