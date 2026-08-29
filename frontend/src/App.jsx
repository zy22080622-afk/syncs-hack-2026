import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Decode from './pages/Decode'
import Search from './pages/Search'
import Term from './pages/Term'
import Explore from './pages/Explore'
import About from './pages/About'

export default function App() {
  return (
    <>
      <Header />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/decode" element={<Decode />} />
          <Route path="/search" element={<Search />} />
          <Route path="/term/:id" element={<Term />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/explore/:cat" element={<Explore />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="site-foot">
        <span>TL Note — ACG Cultural Wiki</span>
        <span className="dim">SYNCS Hack 2026</span>
      </footer>
    </>
  )
}
