import Icon from './Icon'

export default function AuthLayout({ children }) {
  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <div className="court-line-overlay" aria-hidden="true" />
        <div style={{ position: 'relative' }}>
          <div className="d-flex align-items-center gap-2 mb-4">
            <span className="brand-mark">
              <Icon name="court" size={20} strokeWidth={2.1} />
            </span>
            <span className="fw-bold" style={{ letterSpacing: '0.14em' }}>SPORT HUB</span>
          </div>
          <h2 className="auth-visual-title mb-3">
            BOOK YOUR GAME.
            <br />
            PLAY YOUR <span className="text-accent">BEST.</span>
          </h2>
          <p className="text-muted" style={{ maxWidth: 380, lineHeight: 1.7 }}>
            Booking lapangan badminton &amp; futsal dengan cepat, mudah, dan praktis — langsung dari mana saja.
          </p>
        </div>
        <div className="d-flex gap-3" style={{ position: 'relative' }}>
          <div className="step-icon" style={{ margin: 0 }}>
            <Icon name="calendar" size={22} />
          </div>
          <div className="step-icon" style={{ margin: 0 }}>
            <Icon name="clock" size={22} />
          </div>
          <div className="step-icon" style={{ margin: 0 }}>
            <Icon name="check" size={22} />
          </div>
        </div>
      </div>
      <div className="auth-form-side">{children}</div>
    </div>
  )
}