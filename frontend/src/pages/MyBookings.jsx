import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import CourtImage from '../components/CourtImage'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import Icon from '../components/Icon'
import Reveal from '../components/Reveal'
import ConfirmModal from '../components/ConfirmModal'
import { useToast } from '../context/ToastContext'
import { StatSkeleton, ListSkeleton } from '../components/Skeleton'
import { canCancelBooking, formatDate, formatPrice, formatShortDate, formatTime, greeting, todayLocal } from '../utils/format'

const FILTERS = ['All', 'pending', 'confirmed', 'completed', 'cancelled']

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('All')
  const [pendingCancel, setPendingCancel] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const toast = useToast()
  const [userName] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('sporthub_user'))
      return u?.name?.split(' ')[0] || 'Player'
    } catch {
      return 'Player'
    }
  })

  const load = () => {
    api
      .get('/bookings')
      .then((res) => {
        setBookings(res.data.data)
        setError('')
        setLoading(false)
      })
      .catch(() => {
        setError('Gagal memuat riwayat booking')
        setLoading(false)
      })
  }

  useEffect(load, [])

  const doCancel = async () => {
    if (!pendingCancel) return
    setCancelling(true)
    try {
      const res = await api.delete(`/bookings/${pendingCancel.id}`)
      toast.success(res.data?.message || `Booking ${pendingCancel.booking_code} dibatalkan`)
      setPendingCancel(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membatalkan booking')
    } finally {
      setCancelling(false)
    }
  }

  const active = bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed')
  const completed = bookings.filter((b) => b.status === 'completed').length
  const upcoming = [...bookings]
    .filter((b) => (b.status === 'pending' || b.status === 'confirmed') && b.booking_date >= todayLocal())
    .sort((a, b) => (a.booking_date + a.start_time).localeCompare(b.booking_date + b.start_time))[0]

  const filtered = useMemo(() => {
    const sorted = [...bookings].sort((a, b) =>
      (b.booking_date + b.start_time).localeCompare(a.booking_date + a.start_time),
    )
    const list = filter === 'All' ? sorted : sorted.filter((b) => b.status === filter)
    return list.slice(0, 6)
  }, [bookings, filter])

  const counts = useMemo(() => {
    const c = { All: bookings.length }
    FILTERS.slice(1).forEach((s) => {
      c[s] = bookings.filter((b) => b.status === s).length
    })
    return c
  }, [bookings])

  return (
    <section className="sh-section page-fade" style={{ paddingTop: 48 }}>
      <div className="sh-container">
        <Reveal>
          <div className="dash-hero mb-5">
            <div className="court-line-overlay" aria-hidden="true" />
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-4">
              <div>
                <h1 className="dash-hero-title">
                  {greeting().toUpperCase()}, <span className="text-accent">{userName.toUpperCase()}</span>
                </h1>
                <p className="section-subtitle mb-0">Ready for your next game?</p>
              </div>
              <Link to="/courts" className="btn btn-accent btn-lg">
                BOOK A COURT
                <Icon name="arrowRight" size={17} />
              </Link>
            </div>
          </div>
        </Reveal>

        {loading ? (
          <>
            <div className="row g-3 mb-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="col-md-4">
                  <StatSkeleton />
                </div>
              ))}
            </div>
            <ListSkeleton count={3} />
          </>
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => {
              setLoading(true)
              load()
            }}
          />
        ) : (
          <>
            <div className="row g-3 mb-5">
              <div className="col-md-4">
                <Reveal>
                  <StatCard icon="calendar" label="Upcoming" value={active.length} accent />
                </Reveal>
              </div>
              <div className="col-md-4">
                <Reveal delay={80}>
                  <StatCard icon="history" label="Total Bookings" value={bookings.length} />
                </Reveal>
              </div>
              <div className="col-md-4">
                <Reveal delay={160}>
                  <StatCard icon="check" label="Completed" value={completed} />
                </Reveal>
              </div>
            </div>

            <h2 className="section-title mb-4" style={{ fontSize: '1.5rem' }}>UPCOMING BOOKING</h2>

            {upcoming ? (
              <Reveal>
                <div className="booking-hero-card hero-accent mb-5">
                  <CourtImage court={upcoming.court} className="flex-shrink-0" />
                  <div className="booking-hero-body">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className="type-pill">{upcoming.court?.type}</span>
                      <StatusBadge status={upcoming.status} />
                    </div>
                    <h3 className="fw-bolder mb-0">{upcoming.court?.name}</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <div className="info-label">Date</div>
                        <div className="info-value">{formatDate(upcoming.booking_date)}</div>
                      </div>
                      <div className="info-item">
                        <div className="info-label">Time</div>
                        <div className="info-value">
                          {formatTime(upcoming.start_time)} - {formatTime(upcoming.end_time)}
                        </div>
                      </div>
                      <div className="info-item">
                        <div className="info-label">Total</div>
                        <div className="info-value text-accent">{formatPrice(upcoming.total_price)}</div>
                      </div>
                    </div>
                    <div className="d-flex gap-2 mt-2 flex-wrap">
                      <Link to={`/bookings/${upcoming.id}`} className="btn btn-accent">
                        VIEW DETAILS
                        <Icon name="arrowRight" size={16} />
                      </Link>
                      {upcoming.status === 'pending' && (
                        <Link to={`/bookings/${upcoming.id}/payment`} className="btn btn-ghost">
                          Pay Now
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            ) : (
              <div className="mb-5">
                <EmptyState
                  icon="calendar"
                  title="NO UPCOMING GAMES"
                  message="You don't have any upcoming bookings yet."
                  action={
                    <Link to="/courts" className="btn btn-accent">
                      BOOK A COURT
                      <Icon name="arrowRight" size={16} />
                    </Link>
                  }
                />
              </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
              <h2 className="section-title mb-0" style={{ fontSize: '1.5rem' }}>RECENT BOOKINGS</h2>
              {bookings.length > 0 && (
                <div className="filter-pills segmented" role="group" aria-label="Filter status booking">
                  {FILTERS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      className={`filter-pill ${filter === f ? 'active' : ''}`}
                      onClick={() => setFilter(f)}
                      aria-pressed={filter === f}
                    >
                      {f === 'All' ? 'All' : f}
                      <span className="pill-count">{counts[f] ?? 0}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                icon="history"
                title={bookings.length === 0 ? 'NO BOOKINGS YET' : `NO ${filter.toUpperCase()} BOOKINGS`}
                message={
                  bookings.length === 0
                    ? 'Book your first game and start playing.'
                    : `Tidak ada booking berstatus ${filter}.`
                }
                action={
                  bookings.length === 0 ? (
                    <Link to="/courts" className="btn btn-accent">
                      EXPLORE COURTS
                    </Link>
                  ) : (
                    <button type="button" className="btn btn-accent" onClick={() => setFilter('All')}>
                      SHOW ALL
                    </button>
                  )
                }
              />
            ) : (
              <>
                <div className="table-responsive d-none d-lg-block">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Nomor</th>
                        <th>Lapangan</th>
                        <th>Tanggal</th>
                        <th>Jam</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((b) => (
                        <tr key={b.id}>
                          <td className="fw-bold">{b.booking_code}</td>
                          <td>
                            {b.court?.name}
                            <span className="text-muted small"> ({b.court?.type})</span>
                          </td>
                          <td>{formatDate(b.booking_date)}</td>
                          <td>
                            {formatTime(b.start_time)} - {formatTime(b.end_time)}
                          </td>
                          <td className="fw-bold text-accent">{formatPrice(b.total_price)}</td>
                          <td>
                            <StatusBadge status={b.status} />
                          </td>
                          <td>
                            <Link to={`/bookings/${b.id}`} className="btn btn-ghost btn-sm">
                              Detail
                            </Link>
                            {canCancelBooking(b) && (
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm ms-1"
                                onClick={() => setPendingCancel(b)}
                              >
                                Batalkan
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex flex-column gap-3 d-lg-none">
                  {filtered.map((b) => (
                    <div key={b.id} className="booking-row-card">
                      <div className="d-flex justify-content-between align-items-center gap-2">
                        <span className="fw-bold">{b.booking_code}</span>
                        <StatusBadge status={b.status} />
                      </div>
                      <div>
                        <div className="fw-bold">{b.court?.name}</div>
                        <div className="text-muted small">
                          {formatShortDate(b.booking_date)} &middot; {formatTime(b.start_time)} - {formatTime(b.end_time)}
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold text-accent">{formatPrice(b.total_price)}</span>
                        <div className="d-flex gap-2">
                          <Link to={`/bookings/${b.id}`} className="btn btn-ghost btn-sm">
                            Detail
                          </Link>
                          {canCancelBooking(b) && (
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => setPendingCancel(b)}
                            >
                              Batalkan
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        open={!!pendingCancel}
        title="Batalkan booking?"
        message={
          pendingCancel
            ? `Booking ${pendingCancel.booking_code} (${pendingCancel.court?.name}, ${formatShortDate(pendingCancel.booking_date)} ${formatTime(pendingCancel.start_time)}) akan dibatalkan. Tindakan ini tidak bisa dibatalkan.`
            : ''
        }
        confirmLabel="Ya, batalkan"
        danger
        loading={cancelling}
        onConfirm={doCancel}
        onClose={() => {
          if (!cancelling) setPendingCancel(null)
        }}
      />
    </section>
  )
}
