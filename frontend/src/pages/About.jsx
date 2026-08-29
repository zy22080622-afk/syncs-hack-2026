import { TERMS, CATEGORIES } from '../lib/dict'

export default function About() {
  return (
    <section className="section prose-page">
      <h1 className="page-h">About TL Note</h1>

      <p className="page-lede">
        Machine translation gives you the word. TL Note gives you what the word means to the people
        using it.
      </p>

      <h2>Who this is for</h2>
      <ul>
        <li>
          <strong>People new to ACG fandom</strong> — comment sections read like encrypted chatter.
        </li>
        <li>
          <strong>Parents and older users</strong> — you can read every character your child posted
          and still not know what was said.
        </li>
        <li>
          <strong>Cross-language fans</strong> — you love the work but do not read Japanese, and the
          community vocabulary was never translated for you.
        </li>
      </ul>

      <h2>Why a dictionary is not enough</h2>
      <p>
        A dictionary gives definitions. Fandom terms need usage and tone. 草 does not mean grass, 太太
        has nothing to do with wives, and 同担拒否 is a piece of etiquette that no word-for-word
        rendering can carry. Every entry here opens with what a machine translator would tell you,
        and then what the term actually does.
      </p>

      <h2>How entries are written</h2>
      <ul>
        <li>Every entry is written and checked by a person, not generated.</li>
        <li>
          Two levels of explanation: <strong>Simple</strong> never explains slang using more slang;{' '}
          <strong>Full</strong> covers origin, drift and the edges of correct use.
        </li>
        <li>
          Three languages — English, 中文, 日本語 — because the same term often behaves differently in
          each community. That is what the cross-cultural section is for.
        </li>
        <li>
          Terms needing adult context are marked, and <strong>Family mode</strong> hides them.
        </li>
        <li>
          AI can draft an entry for a word we have not covered, but drafts are labelled and never
          enter the wiki without human review.
        </li>
      </ul>

      <h2>Current coverage</h2>
      <p>
        {TERMS.length} entries across {CATEGORIES.length} categories.
      </p>

      <h2>Roadmap</h2>
      <ul>
        <li>Community contribution with editing history and discussion</li>
        <li>A browser extension that shows TL notes inline on Bilibili, X and Discord</li>
        <li>More source languages, starting with Korean</li>
      </ul>

      <p className="dim small">Built at SYNCS Hack 2026.</p>
    </section>
  )
}
