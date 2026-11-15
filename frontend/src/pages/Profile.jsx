import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loading from '../components/Loading'
import Icon from '../components/Icon'
import Reveal from '../components/Reveal'
import { firstLetter } from '../utils/format'

export default function Profile() {
  const { user, loading } = useAuth()

  if (loading) return <Loading />

  return (
    <section className="sh-section page-fade" style={{ paddingTop: 40 }}>
      <div className="sh-container">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <Reveal>
              <div className="card p-4 p-md-5" style={{ borderRadius: 'var(--sh-r-lg)' }}>
              <div className="text-center mb-4">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{
                    width: 88,
                    height: 88,
                    background: 'var(--sh-accent)',
                    color: '#0b0f14',
                    fontSize: '2.2rem',
                    fontWeight: 800,
                  }}
                >
                  {firstLetter(user?.name)}
                </div>
                <h1 className="fw-bolder mb-1" style={{ fontSize: '1.5rem' }}>{user?.name}</h1>
                <span className={`status-badge ${user?.role === 'admin' ? 'status-warning' : 'status-info'}`}>
                  {user?.role === 'admin' ? 'ADMIN' : 'USER'}
                </span>
              </div>

              <hr className="divider" />

              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="summary-label">Nama</span>
                  <span className="summary-value">{user?.name}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="summary-label">Email</span>
                  <span className="summary-value">{user?.email}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="summary-label">Role</span>
                  <span className="summary-value">{user?.role}</span>
                </div>
              </div>

              <hr className="divider" />

              <div className="d-flex gap-2 flex-wrap">
                <Link to="/bookings" className="btn btn-accent flex-grow-1">
                  <Icon name="history" size={16} />
                  RIWAYAT BOOKING
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="btn btn-ghost flex-grow-1">
                    <Icon name="grid" size={16} />
                    ADMIN PANEL
                  </Link>
                )}
              </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}