import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api'
import CourtImage from '../components/CourtImage'
import Loading from '../components/Loading'
import ErrorState from '../components/ErrorState'
import Icon from '../components/Icon'
import Reveal from '../components/Reveal'
import { formatPrice } from '../utils/format'

const FACILITIES = [
  { icon: 'clock', label: 'Open 07:00–21:00' },
  { icon: 'shield', label: 'Maintained daily' },
  { icon: 'users', label: 'Group friendly' },
  { icon: 'check', label: 'Online booking' },
]

export default function CourtDetail() {
  const { id } = useParams()
  const [court, setCourt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    api
      .get(`/courts/${id}`)
      .then((res) => {
        setCourt(res.data.data)
        setError('')
        setLoading(false)
      })
      .catch(() => {
        setError('Lapangan tidak ditemukan')
        setLoading(false)
      })
  }

  useEffect(load, [id])

  if (loading) return <Loading />

  if (error || !court) {
    return (
      <section className="sh-section">
        <div className="sh-container">
          <ErrorState
            title="Court Not Found"
            message={error || 'Lapangan tidak ditemukan'}
            onRetry={() => {
              setLoading(true)
              load()
            }}
          />
          <div className="text-center mt-4">
            <Link to="/courts" className="btn btn-ghost">
              <Icon name="chevronLeft" size={16} />
              Back to Courts
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const isActive = court.status === 'active'

  return (
    <section className="sh-section page-fade" style={{ paddingTop: 40 }}>
      <div className="sh-container">
        <Link to="/courts" className="back-link mb-4">
          <Icon name="chevronLeft" size={16} />
          Back to Courts
        </Link>

        <span className="section-index mb-4"><strong>02</strong> COURT DETAIL</span>

        <div className="row g-5 align-items-start mt-1">
          <div className="col-lg-6">
            <Reveal>
              <CourtImage court={court} className="rounded-4 shadow" style={{ aspectRatio: '4/3' }} />
              <div className="row g-2 mt-3">
                {FACILITIES.map((f) => (
                  <div key={f.label} className="col-6">
                    <div className="d-flex align-items-center gap-2 p-2 px-3 rounded-3" style={{ background: 'var(--sh-card)', border: '1px solid var(--sh-border)' }}>
                      <span className="text-accent d-flex">
                        <Icon name={f.icon} size={16} />
                      </span>
                      <span className="small fw-semibold">{f.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
          <div className="col-lg-6">
            <Reveal delay={80}>
              <span className="type-pill mb-3">{court.type}</span>
              <h1 className="mt-3 fw-bolder" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.03em' }}>
                {court.name}
              </h1>
              <p className="text-muted mb-1">SportHub &middot; 1 lokasi olahraga</p>
              <div className="d-flex align-items-baseline gap-2 my-4 flex-wrap">
                <span className="summary-total">{formatPrice(court.price)}</span>
                <span className="text-muted">/ jam</span>
                <span className="text-muted small w-100">
                  Contoh: 2 jam = {formatPrice(Number(court.price || 0) * 2)} &middot; total akhir dihitung backend.
                </span>
              </div>

              <p className="text-secondary-emphasis" style={{ color: 'var(--sh-muted)', lineHeight: 1.7, maxWidth: 520 }}>
                {court.description || 'Booking lapangan ini sekarang dan rasakan pengalaman bermain terbaik di SportHub.'}
              </p>

              <div className="d-flex align-items-center gap-2 mb-4">
                <span className={`status-badge ${isActive ? 'status-success' : 'status-neutral'}`}>
                  {isActive ? 'AVAILABLE' : 'NOT ACTIVE'}
                </span>
              </div>

              {isActive ? (
                <Link to={`/booking?court=${court.id}`} className="btn btn-accent btn-lg w-100 w-md-auto">
                  BOOK THIS COURT
                  <Icon name="arrowRight" size={17} />
                </Link>
              ) : (
                <div className="alert alert-warning mb-0">
                  Lapangan ini sedang tidak aktif dan belum bisa dibooking.
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
