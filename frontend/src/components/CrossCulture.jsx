import { t } from '../lib/dict'
import { usePrefs, ui } from '../context/PrefsContext'

const FLAG = { ja: 'JA', zh: 'ZH', en: 'EN', ko: 'KO' }

export default function CrossCulture({ rows }) {
  const { lang } = usePrefs()
  if (!rows || !rows.length) return null

  return (
    <section className="block">
      <h3 className="block-h">{ui('crossCulture', lang)}</h3>
      <div className="xc">
        {rows.map((r) => (
          <div key={r.lang}>
            <b>{FLAG[r.lang] || r.lang.toUpperCase()}</b>
            <span>{t(r.note, lang)}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
