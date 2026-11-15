import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Icon from './Icon'
import BrandMark from './BrandMark'
import ThemeToggle from './ThemeToggle'
import { firstLetter } from '../utils/format'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/courts', label: 'Courts', end: false },
  { to: '/booking', label: 'Booking', end: false },
  { to: '/bookings', label: 'Bookings', end: false },
]

function Brand() {
  return (
    <Link to="/" className="navbar-brand">
      <BrandMark />
      SPORT HUB
    </Link>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="navbar navbar-expand-xl sh-navbar">
      <div className="sh-container">
        <Brand />
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#siteNav"
          aria-controls="siteNav"
          aria-expanded="false"
          aria-label="Buka menu navigasi"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="siteNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-lg-1">
            {links.map((l) => (
              <li className="nav-item" key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
            {user?.role === 'admin' && (
              <li className="nav-item">
                <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}>
                  Admin
                </NavLink>
              </li>
            )}
          </ul>
          <ul className="navbar-nav align-items-lg-center gap-lg-2">
            <li className="nav-item d-flex align-items-center mt-2 mt-lg-0 me-lg-1">
              <ThemeToggle compact />
            </li>
            {user ? (
              <>
                <li className="nav-item">
                  <NavLink to="/profile" className="nav-user-chip">
                    <span className="nav-avatar">{firstLetter(user.name)}</span>
                    <span className="nav-user-name">{user.name}</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <button type="button" className="btn btn-ghost btn-sm mt-2 mt-lg-0" onClick={logout}>
                    <Icon name="logout" size={15} />
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink to="/login" className="btn btn-ghost btn-sm mt-2 mt-lg-0">
                    Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/register" className="btn btn-accent btn-sm mt-2 mt-lg-0">
                    Register
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}