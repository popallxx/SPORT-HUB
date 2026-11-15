import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import Loading from '../components/Loading'
import StatusBadge from '../components/StatusBadge'
import ErrorState from '../components/ErrorState'
import Icon from '../components/Icon'
import Reveal from '../components/Reveal'
import ConfirmModal from '../components/ConfirmModal'
import { useToast } from '../context/ToastContext'
import { canCancelBooking, formatDate, formatPrice, formatTime } from '../utils/format'

export default function BookingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const load = () => {
    api
      .get(`/bookings/${id}`)
      .then((res) => {
        setBooking(res.data.data)
        setError('')
        setLoading(false)
      })
      .catch(() => {
        setError('Booking tidak ditemukan')
        setLoading(false)
      })
  }

  useEffect(load, [id])

  const doCancel = async () => {
    setCancelling(true)
    try {
      const res = await api.delete(`/bookings/${booking.id}`)
      toast.success(res.data?.message || `Booking ${booking.booking_code} dibatalkan`)
      setConfirmCancel(false)
      navigate('/bookings')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membatalkan booking')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return <Loading />

  if (error || !booking) {
    return (
      <section className="sh-section">
        <div className="sh-container">
          <ErrorState title="Booking Not Found" message={error || 'Booking tidak ditemukan'} onRetry={() => { setLoading(true); load() }} />
          <div className="text-center mt-4">
            <Link to="/bookings" className="btn btn-ghost">
              <Icon name="chevronLeft" size={16} />
              Back to My Bookings
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const canCancel = canCancelBooking(booking)

  return (
    <section className="sh-section page-fade" style={{ paddingTop: 40 }}>
      <div className="sh-container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <Link to="/bookings" className="back-link mb-4">
              <Icon name="chevronLeft" size={16} />
              Back to My Bookings
            </Link>

            <Reveal>
              <div className="card p-4 p-md-5" style={{ borderRadius: 'var(--sh-r-lg)' }}>
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                  <div>
                    <h1 className="fw-bolder mb-1" style={{ letterSpacing: '0.02em' }}>{booking.booking_code}</h1>
                    <p className="text-muted mb-0">Booking detail</p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>

                <hr className="divider" />

                <div className="info-grid mb-4 mt-4">
                  <div className="info-item">
                    <div className="info-label">Court</div>
                    <div className="info-value">
                      {booking.court?.name} <span className="text-muted">({booking.court?.type})</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Date</div>
                    <div className="info-value">{formatDate(booking.booking_date)}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Time</div>
                    <div className="info-value">
                      {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Total</div>
                    <div className="info-value text-accent" style={{ fontSize: '1.1rem' }}>{formatPrice(booking.total_price)}</div>
                  </div>
                </div>

                {booking.payment && (
                  <div className="card p-3 mb-4" style={{ background: 'var(--sh-surface)' }}>
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                      <div>
                        <div className="info-label">Pembayaran</div>
                        <div className="fw-bold">{booking.payment.payment_method.toUpperCase()}</div>
                      </div>
                      <span className={`status-badge ${
                        booking.payment.payment_status === 'paid'
                          ? 'status-success'
                          : booking.payment.payment_status === 'refunded'
                            ? 'status-warning'
                            : 'status-neutral'
                      }`}>
                        {booking.payment.payment_status.toUpperCase()}
                      </span>
                    </div>
                    {booking.payment.payment_status === 'refunded' && (
                      <p className="text-muted small mb-0 mt-2">
                        Pembayaran ditandai refund. Pengembalian dana diproses manual oleh admin.
                      </p>
                    )}
                  </div>
                )}

                <div className="d-flex flex-column gap-2 mt-2">
                  {booking.status === 'pending' && (
                    <Link to={`/bookings/${booking.id}/payment`} className="btn btn-accent w-100 btn-lg">
                      LANJUTKAN KE PEMBAYARAN
                      <Icon name="arrowRight" size={17} />
                    </Link>
                  )}
                  {canCancel && (
                    <button
                      type="button"
                      className="btn btn-outline-danger w-100"
                      onClick={() => setConfirmCancel(true)}
                    >
                      Batalkan Booking
                    </button>
                  )}
                  <Link to="/bookings" className="btn btn-ghost w-100">
                    Kembali ke Booking Saya
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmCancel}
        title="Batalkan booking?"
        message={`Booking ${booking.booking_code} akan dibatalkan. Tindakan ini tidak bisa dibatalkan.`}
        confirmLabel="Ya, batalkan"
        danger
        loading={cancelling}
        onConfirm={doCancel}
        onClose={() => {
          if (!cancelling) setConfirmCancel(false)
        }}
      />
    </section>
  )
}
