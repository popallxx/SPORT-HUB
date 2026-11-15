import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api'
import StatusBadge from '../components/StatusBadge'
import ErrorState from '../components/ErrorState'
import Icon from '../components/Icon'
import Reveal from '../components/Reveal'
import BookingSteps, { BOOKING_STEPS_FULL } from '../components/BookingSteps'
import { useToast } from '../context/ToastContext'
import { formatDate, formatPrice, formatTime } from '../utils/format'

const METHODS = [
  { value: 'qris', label: 'QRIS', desc: 'Scan kode QR untuk membayar', icon: 'grid' },
  { value: 'transfer', label: 'Bank Transfer', desc: 'Transfer ke rekening SportHub', icon: 'chart' },
  { value: 'cash', label: 'Cash', desc: 'Bayar langsung di lokasi', icon: 'pin' },
]

const STEPS = BOOKING_STEPS_FULL

export default function Payment() {
  const { id } = useParams()
  const toast = useToast()
  const [booking, setBooking] = useState(null)
  const [method, setMethod] = useState('qris')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const payErrorRef = useRef(null)

  useEffect(() => {
    if (error && !loading) payErrorRef.current?.focus()
  }, [error, loading])

  useEffect(() => {
    api
      .get(`/bookings/${id}`)
      .then((res) => setBooking(res.data.data))
      .catch(() => setError('Booking tidak ditemukan'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border" role="status" style={{ color: 'var(--sh-accent)' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <section className="sh-section">
        <div className="sh-container">
          <ErrorState title="Booking Not Found" message={error || 'Booking tidak ditemukan'} />
          <div className="text-center mt-4">
            <Link to="/bookings" className="btn btn-ghost">Kembali</Link>
          </div>
        </div>
      </section>
    )
  }

  if (success) {
    return (
      <section className="sh-section page-fade" style={{ paddingTop: 0 }}>
        <div className="sh-container">
          <BookingSteps steps={STEPS} currentStep={5} />
          <Reveal>
            <div className="success-card">
            <div className="success-icon">
              <Icon name="check" size={36} strokeWidth={2.5} />
            </div>
            <h2 className="success-title">BOOKING CONFIRMED</h2>
            <p className="success-desc">Your court has been successfully booked.</p>

            <div className="mb-4">
              <div className="summary-row">
                <span className="summary-label">Court</span>
                <span className="summary-value">{booking.court?.name} ({booking.court?.type})</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Date</span>
                <span className="summary-value">{formatDate(booking.booking_date)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Time</span>
                <span className="summary-value">
                  {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Total</span>
                <span className="summary-value text-accent" style={{ fontSize: '1.1rem' }}>{formatPrice(booking.total_price)}</span>
              </div>
              <div className="summary-row" style={{ borderBottom: 'none' }}>
                <span className="summary-label">Status</span>
                <StatusBadge status={booking.status} />
              </div>
            </div>

            <div className="d-flex flex-column gap-2" style={{ maxWidth: 320, margin: '0 auto' }}>
              <Link to={`/bookings/${booking.id}`} className="btn btn-accent w-100 btn-lg">
                VIEW BOOKING
              </Link>
              <Link to="/bookings" className="btn btn-ghost w-100">
                BACK TO DASHBOARD
              </Link>
            </div>
            </div>
          </Reveal>
        </div>
      </section>
    )
  }

  if (booking.status !== 'pending') {
    return (
      <section className="sh-section" style={{ paddingTop: 0 }}>
        <div className="sh-container">
          <div className="state-box">
            <div className="state-icon">
              <Icon name="check" size={28} />
            </div>
            <h3 className="state-title">BOOKING SUDAH DIKONFIRMASI</h3>
            <p className="state-desc">Booking ini sudah tidak berstatus pending.</p>
            <Link to={`/bookings/${booking.id}`} className="btn btn-accent">
              LIHAT DETAIL BOOKING
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const pay = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await api.post(`/bookings/${booking.id}/payment`, { payment_method: method })
      const res = await api.get(`/bookings/${booking.id}`)
      setBooking(res.data.data)
      setSuccess(true)
      toast.success('Pembayaran berhasil, booking dikonfirmasi')
    } catch (err) {
      const msg = err.response?.data?.message || 'Pembayaran gagal'
      setError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="sh-section page-fade" style={{ paddingTop: 40 }}>
      <div className="sh-container">
        <BookingSteps steps={STEPS} currentStep={4} />
        <div className="row justify-content-center g-4">
          <div className="col-lg-4">
            <Reveal>
              <div className="card p-4" style={{ borderRadius: 'var(--sh-r-lg)' }}>
              <h5 className="mb-3" style={{ fontSize: '0.8rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--sh-muted)' }}>
                Order Summary
              </h5>
              <div className="summary-row">
                <span className="summary-label">Booking</span>
                <span className="summary-value">{booking.booking_code}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Court</span>
                <span className="summary-value">{booking.court?.name} ({booking.court?.type})</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Date</span>
                <span className="summary-value">{formatDate(booking.booking_date)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Time</span>
                <span className="summary-value">
                  {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-baseline pt-3 pb-2">
                <span className="summary-label" style={{ fontSize: '0.95rem' }}>Total</span>
                <span className="summary-total">{formatPrice(booking.total_price)}</span>
              </div>
              <div>
                <StatusBadge status={booking.status} />
              </div>
              </div>
            </Reveal>
          </div>

          <div className="col-lg-6">
            <Reveal delay={80}>
              <div className="card p-4 p-md-5" style={{ borderRadius: 'var(--sh-r-lg)' }}>
              <h1 className="fw-bolder mb-1" style={{ fontSize: '1.6rem' }}>PEMBAYARAN</h1>
              <p className="text-muted mb-4">Pilih metode pembayaran dan selesaikan bookingmu.</p>

              <form onSubmit={pay}>
                <label className="form-label fw-bold">Pilih Metode Pembayaran</label>
                <div className="d-flex flex-column gap-3 mb-4">
                  {METHODS.map((m) => (
                    <label
                      key={m.value}
                      className={`payment-method ${method === m.value ? 'selected' : ''}`}
                    >
                      <input
                        className="visually-hidden"
                        type="radio"
                        name="method"
                        value={m.value}
                        checked={method === m.value}
                        onChange={(e) => setMethod(e.target.value)}
                      />
                      <div className="payment-method-icon">
                        <Icon name={m.icon} size={20} />
                      </div>
                      <div className="payment-method-info">
                        <div className="payment-method-name">{m.label}</div>
                        <div className="payment-method-desc">{m.desc}</div>
                      </div>
                      {method === m.value && (
                        <Icon name="check" size={18} className="text-accent" />
                      )}
                    </label>
                  ))}
                </div>

                {error && (
                  <div ref={payErrorRef} tabIndex={-1} role="alert" className="alert alert-danger">
                    <strong className="d-block mb-1">Pembayaran gagal</strong>
                    {error}
                  </div>
                )}

                <button type="submit" className="btn btn-accent w-100 btn-lg" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ borderColor: '#0b0f14 transparent #0b0f14 #0b0f14' }} />
                      Memproses...
                    </>
                  ) : (
                    <>
                      CONFIRM PAYMENT
                      <Icon name="arrowRight" size={17} />
                    </>
                  )}
                </button>
              </form>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
