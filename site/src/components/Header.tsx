import { Link } from 'react-router-dom'
import * as s from '../styles/shared.css'

export function Header({ activePage }: { activePage?: 'thesis' | 'paper' }) {
  return (
    <header className={s.header}>
      <div className={s.headerInner}>
        <Link to="/" className={s.logo}>
          <span className={s.logoMark}>F</span>
          <span className={s.logoText}>arness</span>
        </Link>
        <nav className={s.nav}>
          <Link
            to="/thesis"
            className={`${s.navLink} ${activePage === 'thesis' ? s.navLinkActive : ''}`}
          >
            Thesis
          </Link>
          <Link
            to="/paper"
            className={`${s.navLink} ${activePage === 'paper' ? s.navLinkActive : ''}`}
          >
            Paper
          </Link>
          <a
            href="https://github.com/MaxGhenis/farness"
            className={`${s.navLink} ${s.navLinkGh}`}
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  )
}
