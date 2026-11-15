import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Icon from '../../components/Icon'
import ThemeToggle from '../../components/ThemeToggle'
import { useAuth } from '../../context/AuthContext'

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="admin-shell">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <main className="admin-main">
        <div className="admin-topbar">
          <button
            type="button"
            className="btn btn-ghost btn-icon admin-toggle"
            onClick={() => setOpen(true)}
            aria-label="Buka menu admin"
          >
            <Icon name="menu" size={19} />
          </button>
          <div className="d-flex align-items-center gap-2 ms-auto">
            <ThemeToggle compact />
            <span className="fw-bold d-lg-none" style={{ fontSize: '0.95rem' }}>{user?.name}</span>
            <span className="nav-avatar d-lg-none">{user?.name?.charAt(0)?.toUpperCase()}</span>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  )
}