import { t } from '../lib/dict'
import { usePrefs, ui } from '../context/PrefsContext'

/** 整个产品的论点就在这个组件里：机翻说什么 vs 实际是什么 */
export default function MachineVsReal({ term }) {
  const { lang } = usePrefs()

  return (
    <div className="vs">
      <div className="vs-row bad">
        <div className="vs-lbl">{ui('machineSays', lang)}</div>
        <div className="vs-val struck">{term.machine_translation}</div>
      </div>
      <div className="vs-row good">
        <div className="vs-lbl">{ui('actually', lang)}</div>
        <div className="vs-val">{t(term.real_meaning, lang)}</div>
      </div>
    </div>
  )
}
