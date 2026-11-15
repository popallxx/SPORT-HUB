import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Icon from './Icon'
import BrandMark from './BrandMark'
import { firstLetter } from '../utils/format'

const links = [
  { to: '/admin', label: 'Dashboard', icon: 'grid', end: true },
  { to: '/admin/courts', label: 'Courts', icon: 'shuttle', end: false },
  { to: '/admin/bookings', label: 'Bookings', icon: 'calendar', end: false },
  { to: '/admin/users', label: 'Users', icon: 'users', end: false },
]

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />}
      <aside className={`admin-sidebar ${open ? 'open' : ''}`} aria-label="Menu admin">
        <Link to="/" className="sidebar-brand">
          <BrandMark />
          SPORT HUB
        </Link>
        <nav className="sidebar-nav">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-active' : ''}`}
              onClick={onClose}
            >
              <Icon name={l.icon} size={19} />
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="d-flex align-items-center gap-2 px-2 pb-2">
            <span className="nav-avatar">{firstLetter(user?.name)}</span>
            <div className="lh-sm">
              <div className="fw-bold" style={{ fontSize: '0.9rem' }}>{user?.name}</div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>Admin</div>
            </div>
          </div>
          <button type="button" className="btn btn-ghost w-100" onClick={logout}>
            <Icon name="logout" size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}