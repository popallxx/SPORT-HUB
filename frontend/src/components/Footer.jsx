import { Link } from 'react-router-dom'
import Icon from './Icon'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="sh-footer">
      <div className="sh-container py-5">
        <div className="sh-footer-cols">
          <div>
            <Link to="/" className="navbar-brand" style={{ color: 'var(--sh-text)' }}>
              <span className="brand-mark">
                <Icon name="bolt" size={18} strokeWidth={2.4} />
              </span>
              SPORT HUB
            </Link>
            <p className="text-muted mb-0 mt-3" style={{ maxWidth: 380, lineHeight: 1.65 }}>
              Platform booking lapangan olahraga. Pilih lapangan, pilih jadwal, langsung main.
              Buka setiap hari 07:00–21:00.
            </p>
          </div>
          <nav aria-label="Navigasi footer">
            <p className="fw-bold mb-2" style={{ fontSize: '0.78rem', letterSpacing: '0.16em', color: 'var(--sh-muted)' }}>
              EXPLORE
            </p>
            <Link to="/courts" className="sh-footer-link">Find Courts</Link>
            <Link to="/booking" className="sh-footer-link">Book a Game</Link>
            <Link to="/bookings" className="sh-footer-link">My Bookings</Link>
            <Link to="/profile" className="sh-footer-link">Profile</Link>
          </nav>
          <div>
            <p className="fw-bold mb-2" style={{ fontSize: '0.78rem', letterSpacing: '0.16em', color: 'var(--sh-muted)' }}>
              SPORTS
            </p>
            <p className="mb-1">
              <span className="type-pill">Badminton</span>{' '}
              <span className="type-pill">Futsal</span>
            </p>
            <p className="text-muted small mb-0 mt-2">
              Butuh bantuan? Hubungi admin via halaman booking.
            </p>
          </div>
        </div>
        <hr className="divider my-4" />
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <p className="mb-0 small text-muted">&copy; {year} SportHub. All rights reserved.</p>
          <p className="mb-0 small text-muted">Badminton &middot; Futsal &middot; Easy Booking</p>
        </div>
      </div>
    </footer>
  )
}
