import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import CourtCard from '../components/CourtCard'
import Icon from '../components/Icon'
import Reveal from '../components/Reveal'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import { CourtGridSkeleton } from '../components/Skeleton'
import { formatPrice } from '../utils/format'

const steps = [
  { icon: 'calendar', num: '01', title: 'Pick a Court', desc: 'Pilih lapangan badminton atau futsal yang sesuai dengan jadwalmu.' },
  { icon: 'clock', num: '02', title: 'Choose Your Slot', desc: 'Cek ketersediaan slot per jam dan tentukan waktu mainmu.' },
  { icon: 'check', num: '03', title: 'Book & Play', desc: 'Konfirmasi booking, selesaikan pembayaran, dan langsung main.' },
]

const SPORT_ROWS = [
  { key: 'badminton', label: 'BADMINTON', sub: 'Indoor • per jam', mark: 'BDM' },
  { key: 'futsal', label: 'FUTSAL', sub: 'Outdoor • per jam', mark: 'FTS' },
]

function HeroVisual({ compact = false, courts = [], loading = false }) {
  const rows = SPORT_ROWS.map((r) => {
    const list = courts.filter((c) => String(c.type || '').toLowerCase().includes(r.key))
    const prices = list.map((c) => Number(c.price)).filter((n) => Number.isFinite(n) && n > 0)
    return { ...r, count: list.length, from: prices.length ? Math.min(...prices) : null }
  })
  const total = courts.length

  return (
    <div className={`hero-visual ${compact ? 'hero-visual-compact d-lg-none' : ''}`}>
      <div className="court-line-overlay" aria-hidden="true" />
      <div className="hero-score">
        <div className="hero-score-head">
          <span className="hero-score-live">OPEN DAILY</span>
          <span className="hero-score-hours">07–21</span>
        </div>
        <div className="hero-score-rows">
          {rows.map((r) => (
            <div key={r.key} className="hero-score-row">
              <span className="hero-sport-mark" aria-hidden="true">
                {r.mark}
              </span>
              <span className="hero-score-text">
                <span className="hero-score-name">{r.label}</span>
                <span className="hero-score-sub">{r.sub}</span>
              </span>
              <span className="hero-score-meta">
                <span className="hero-score-count">{loading ? '—' : `${r.count} court`}</span>
                <span className="hero-score-price">
                  {r.from != null ? `mulai ${formatPrice(r.from)}/jam` : 'info di katalog'}
                </span>
              </span>
            </div>
          ))}
        </div>
        <div className="hero-score-foot">
          <span>
            <strong>{loading ? '—' : total}</strong> lapangan terdaftar
          </span>
          <span>Buka setiap hari</span>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [courts, setCourts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    api
      .get('/courts')
      .then((res) => {
        setCourts(res.data.data)
        setError('')
        setLoading(false)
      })
      .catch(() => {
        setError('Gagal memuat data lapangan')
        setLoading(false)
      })
  }

  useEffect(load, [])

  const types = [...new Set(courts.map((c) => c.type))]

  return (
    <div className="page-fade">
      <header className="sh-hero">
        <div className="sh-container position-relative">
          <div className="row align-items-center g-5">
            <div className="col-lg-7 hero-copy">
              <span className="eyebrow">SPORT FACILITY BOOKING</span>
              <h1 className="hero-title mt-3">
                BOOK YOUR GAME.
                <br />
                PLAY YOUR <span className="line-accent">BEST.</span>
              </h1>
              <p className="hero-sub mt-4">
                Booking lapangan olahraga dengan cepat, mudah, dan praktis. Pilih lapangan,
                tentukan jam, bayar online — langsung main.
              </p>
              <div className="d-flex flex-wrap gap-3 hero-cta">
                <Link to="/booking" className="btn btn-accent btn-lg">
                  BOOK A COURT
                  <Icon name="arrowRight" size={17} />
                </Link>
                <Link to="/courts" className="btn btn-ghost btn-lg">
                  EXPLORE COURTS
                </Link>
              </div>
              <HeroVisual compact courts={courts} loading={loading} />
            </div>
            <div className="col-lg-5 d-none d-lg-flex hero-visual-col">
              <Reveal className="w-100 d-flex justify-content-end">
                <HeroVisual courts={courts} loading={loading} />
              </Reveal>
            </div>
          </div>
        </div>
      </header>

      <section className="sh-section" style={{ paddingTop: 48 }}>
        <div className="sh-container">
          <div className="text-center mb-5">
            <span className="section-index"><strong>01</strong> HOW IT WORKS</span>
            <h2 className="section-title mt-3">MAIN DALAM 3 LANGKAH</h2>
          </div>
          <div className="row g-4 justify-content-center">
            {steps.map((s, i) => (
              <div key={s.num} className="col-md-6 col-lg-4">
                <Reveal delay={i * 80}>
                  <div className="step-card h-100">
                    <span className="step-num">{s.num}</span>
                    <div className="step-icon">
                      <Icon name={s.icon} size={22} />
                    </div>
                    <h3 className="fs-5">{s.title}</h3>
                    <p className="text-muted mb-0">{s.desc}</p>
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sh-section" id="our-courts" style={{ paddingTop: 0 }}>
        <div className="sh-container">
          <div className="text-center mb-5">
            <span className="eyebrow">Our Facilities</span>
            <h2 className="section-title mt-3">OUR COURTS</h2>
            <p className="section-subtitle">Find the right court for your game.</p>
          </div>

          {loading ? (
            <CourtGridSkeleton count={3} />
          ) : error ? (
            <ErrorState
              message={error}
              onRetry={() => {
                setLoading(true)
                load()
              }}
            />
          ) : courts.length === 0 ? (
            <EmptyState
              icon="shuttle"
              title="NO COURTS AVAILABLE"
              message="There are no courts available right now."
              action={
                <button
                  type="button"
                  className="btn btn-accent"
                  onClick={() => {
                    setLoading(true)
                    load()
                  }}
                >
                  <Icon name="refresh" size={16} />
                  REFRESH
                </button>
              }
            />
          ) : (
            <>
              <div className="row g-4">
                {courts.map((court, i) => (
                  <div key={court.id} className="col-md-6 col-lg-4">
                    <Reveal delay={(i % 3) * 80}>
                      <CourtCard court={court} />
                    </Reveal>
                  </div>
                ))}
              </div>
              {types.length > 0 && (
                <div className="d-flex flex-wrap gap-2 justify-content-center mt-5">
                  {types.map((t) => (
                    <span key={t} className="type-pill">{t}</span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="sh-section" style={{ paddingTop: 0 }}>
        <div className="sh-container">
          <Reveal>
            <div className="dash-hero">
              <div className="court-line-overlay" aria-hidden="true" />
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-4">
                <div>
                  <span className="eyebrow">READY TO PLAY?</span>
                  <h2 className="dash-hero-title mt-2">
                    AMANKAN JAM TERBAIKMU <span className="text-accent">MALAM INI.</span>
                  </h2>
                  <p className="section-subtitle mb-0">Slot 07:00–21:00 dibuka setiap hari. Tanpa antre, tanpa telepon.</p>
                </div>
                <Link to="/booking" className="btn btn-accent btn-lg">
                  BOOK NOW
                  <Icon name="arrowRight" size={17} />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
