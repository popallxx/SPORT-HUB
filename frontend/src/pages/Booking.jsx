import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Navigate, useSearchParams, Link } from 'react-router-dom'
import api from '../services/api'
import CourtImage from '../components/CourtImage'
import ErrorState from '../components/ErrorState'
import Icon from '../components/Icon'
import Reveal from '../components/Reveal'
import BookingSteps from '../components/BookingSteps'
import { useToast } from '../context/ToastContext'
import { formatPrice, formatShortDate, todayLocal } from '../utils/format'

const WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

function toDateStr(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const STEPS = [
  { num: '01', label: 'Court' },
  { num: '02', label: 'Date & Time' },
  { num: '03', label: 'Summary' },
  { num: '04', label: 'Payment' },
]

function DatePickerInline({ value, min, onChange }) {
  const [view, setView] = useState(() => {
    const d = new Date(value + 'T00:00:00')
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const minDate = min ? new Date(min + 'T00:00:00') : null
  const firstDay = new Date(view.year, view.month, 1)
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()
  const lead = firstDay.getDay()

  const canPrev = !minDate || view.year > minDate.getFullYear() || (view.year === minDate.getFullYear() && view.month > minDate.getMonth())

  const goPrev = () => {
    if (!canPrev) return
    setView({ year: view.month === 0 ? view.year - 1 : view.year, month: view.month === 0 ? 11 : view.month - 1 })
  }

  const goNext = () => {
    setView({ year: view.month === 11 ? view.year + 1 : view.year, month: view.month === 11 ? 0 : view.month + 1 })
  }

  const todayStr = toDateStr(new Date())

  const cells = []
  for (let i = 0; i < lead; i++) cells.push(<div key={`lead-${i}`} />)
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${view.year}-${String(view.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const disabled = minDate ? dateStr < min : false
    const selected = dateStr === value
    cells.push(
      <button
        key={dateStr}
        type="button"
        className={`calendar-day ${selected ? 'selected' : ''} ${dateStr === todayStr ? 'today' : ''}`}
        disabled={disabled}
        onClick={() => onChange(dateStr)}
        aria-label={`Pilih tanggal ${dateStr}`}
        aria-pressed={selected}
      >
        {d}
      </button>
    )
  }

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button type="button" className="btn btn-ghost btn-icon" onClick={goPrev} disabled={!canPrev} aria-label="Bulan sebelumnya">
          <Icon name="chevronLeft" size={18} />
        </button>
        <div className="calendar-title">{MONTHS[view.month]} {view.year}</div>
        <button type="button" className="btn btn-ghost btn-icon" onClick={goNext} aria-label="Bulan berikutnya">
          <Icon name="chevronRight" size={18} />
        </button>
      </div>
      <div className="calendar-grid">
        {WEEKDAYS.map((w) => (
          <div key={w} className="calendar-weekday">{w}</div>
        ))}
        {cells}
      </div>
    </div>
  )
}

function TimeSlotGridInline({ slots, value, onSelect, loading }) {
  if (loading) {
    return (
      <div className="slot-grid" aria-busy="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 44, borderRadius: 8 }} />
        ))}
      </div>
    )
  }

  if (!slots || slots.length === 0) {
    return <p className="text-muted mb-0" style={{ padding: '12px 2px' }}>Tidak ada slot tersedia pada tanggal ini.</p>
  }

  return (
    <div className="slot-grid" role="group" aria-label="Pilih jam mulai">
      {slots.map((slot) => {
        const selectable = slot.available && !slot.past
        const selected = value === slot.start_time
        let cls = 'slot-btn'
        if (selected) cls += ' selected'
        else if (selectable) cls += ' available'
        return (
          <button
            key={slot.start_time}
            type="button"
            className={cls}
            disabled={!selectable}
            onClick={() => onSelect(slot.start_time)}
            aria-pressed={selected}
            aria-label={`Jam ${slot.start_time.slice(0, 2)}:00`}
          >
            {slot.start_time.slice(0, 5)}
          </button>
        )
      })}
    </div>
  )
}

function BookingSummaryInline({ court, date, startTime, endTime, duration, total, submitting, onSubmit }) {
  if (!court || !startTime) return null

  return (
    <div className="card p-4 summary-sticky" style={{ borderRadius: 'var(--sh-r-lg)' }}>
      <h5 className="mb-3" style={{ fontSize: '0.8rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--sh-muted)' }}>
        Booking Summary
      </h5>
      <div className="summary-row">
        <span className="summary-label">Court</span>
        <span className="summary-value">{court.name}</span>
      </div>
      <div className="summary-row">
        <span className="summary-label">Date</span>
        <span className="summary-value">{formatShortDate(date)}</span>
      </div>
      <div className="summary-row">
        <span className="summary-label">Time</span>
        <span className="summary-value">{startTime} - {endTime}</span>
      </div>
      <div className="summary-row">
        <span className="summary-label">Duration</span>
        <span className="summary-value">{duration} jam</span>
      </div>
      <div className="d-flex justify-content-between align-items-baseline pt-3 pb-2">
        <span className="summary-label" style={{ fontSize: '0.95rem' }}>Total</span>
        <span className="summary-total">{formatPrice(total)}</span>
      </div>
      <button type="button" className="btn btn-accent w-100 btn-lg" onClick={onSubmit} disabled={submitting || !total} aria-live="polite" aria-label={total ? `Lanjut ke pembayaran, total ${total}` : 'Pilih jam untuk melanjutkan'}>
        {submitting ? (
          <>
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ borderColor: '#0b0f14 transparent #0b0f14 #0b0f14' }} />
            Memproses...
          </>
        ) : (
          <>
            CONTINUE TO PAYMENT
            <Icon name="arrowRight" size={17} />
          </>
        )}
      </button>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div className="spinner-border" role="status" style={{ color: 'var(--sh-accent)' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  )
}

export default function Booking() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const courtId = searchParams.get('court') || ''

  const [courts, setCourts] = useState([])
  const [courtsLoading, setCourtsLoading] = useState(true)
  const [courtsError, setCourtsError] = useState('')
  const [court, setCourt] = useState(null)
  const [date, setDate] = useState(todayLocal())
  const [slots, setSlots] = useState([])
  const [startTime, setStartTime] = useState('')
  const [duration, setDuration] = useState(1)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsError, setSlotsError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const submitErrorRef = useRef(null)

  useEffect(() => {
    if (submitError) submitErrorRef.current?.focus()
  }, [submitError])

  const loadSlots = (targetCourt, targetDate) => {
    if (!targetCourt) return
    setSlotsLoading(true)
    setStartTime('')
    setSlotsError('')
    api
      .get(`/courts/${targetCourt.id}/slots?date=${targetDate}`)
      .then((res) => setSlots(res.data.data.slots))
      .catch(() => setSlotsError('Gagal memuat jadwal ketersediaan'))
      .finally(() => setSlotsLoading(false))
  }

  const selectCourt = (c) => {
    setCourt(c)
    loadSlots(c, date)
  }

  useEffect(() => {
    if (!user) return
    api
      .get('/courts')
      .then((res) => {
        const list = res.data.data
        setCourts(list)
        if (courtId) {
          const c = list.find((x) => String(x.id) === String(courtId))
          if (c) selectCourt(c)
        }
      })
      .catch(() => setCourtsError('Gagal memuat daftar lapangan'))
      .finally(() => setCourtsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const onDateChange = (d) => {
    setDate(d)
    if (court) loadSlots(court, d)
  }

  const endTime = startTime
    ? String(Number(startTime.slice(0, 2)) + Number(duration)).padStart(2, '0') + ':00'
    : ''

  const totalPrice = court && startTime ? Number(court.price) * Number(duration) : 0

  // 0=Court, 1=Date&Time (sebagian), 2=Summary siap, 3=Payment (di halaman berikutnya)
  const currentStep = !court ? 0 : !startTime ? 1 : 2

  const submit = async (e) => {
    e.preventDefault()
    if (!court || !date || !startTime || !endTime) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await api.post('/bookings', {
        court_id: court.id,
        booking_date: date,
        start_time: startTime,
        end_time: endTime,
      })
      toast.success('Booking dibuat, lanjut ke pembayaran')
      navigate(`/bookings/${res.data.data.id}/payment`)
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal membuat booking'
      setSubmitError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner />

  if (!user) return <Navigate to="/login" replace />

  return (
    <section className="sh-section page-fade" style={{ paddingTop: 40 }}>
      <div className="sh-container">
        <Link to="/courts" className="back-link mb-3 d-inline-flex">
          <Icon name="chevronLeft" size={16} />
          Back to Courts
        </Link>

        <BookingSteps steps={STEPS} currentStep={currentStep} />

        <div className="row g-4 align-items-start">
          <div className="col-lg-5">
            {court ? (
              <div className="card p-4" style={{ borderRadius: 'var(--sh-r-lg)' }}>
                <CourtImage court={court} className="rounded-3 mb-3" style={{ aspectRatio: '16/10' }} />
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="type-pill">{court.type}</span>
                </div>
                <h3 className="fw-bold mb-1">{court.name}</h3>
                <p className="text-muted mb-0">SportHub &middot; Sewa per jam</p>
                <div className="mt-3">
                  <span className="court-card-price">
                    {formatPrice(court.price)} <span>/ jam</span>
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm mt-3 align-self-start"
                  onClick={() => {
                    setCourt(null)
                    setSlots([])
                    setStartTime('')
                  }}
                >
                  <Icon name="refresh" size={14} />
                  Ganti lapangan
                </button>
              </div>
            ) : (
              <div className="card p-4" style={{ borderRadius: 'var(--sh-r-lg)' }}>
                <h5 className="fw-bold mb-1">Pilih Lapangan</h5>
                <p className="text-muted small mb-3">Pilih lapangan yang ingin kamu booking.</p>
                {courtsLoading ? (
                  <div className="d-flex flex-column gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="skeleton" style={{ height: 60, borderRadius: 8 }} />
                    ))}
                  </div>
                ) : courtsError ? (
                  <ErrorState message={courtsError} onRetry={() => window.location.reload()} />
                ) : courts.length === 0 ? (
                  <p className="text-muted">Belum ada lapangan tersedia.</p>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {courts.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className="btn btn-ghost justify-content-between text-start"
                        onClick={() => selectCourt(c)}
                      >
                        <span>
                          <strong>{c.name}</strong>
                          <span className="text-muted small d-block">{c.type} &middot; {formatPrice(c.price)}/jam</span>
                        </span>
                        <Icon name="chevronRight" size={16} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="col-lg-7">
            {!court ? (
              <div className="state-box">
                <div className="state-icon">
                  <Icon name="calendar" size={28} />
                </div>
                <h3 className="state-title">PILIH LAPANGAN DULU</h3>
                <p className="state-desc">Pilih lapangan di panel kiri untuk mulai menentukan tanggal dan jam bermain.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-4">
                <Reveal>
                  <div className="card p-4" style={{ borderRadius: 'var(--sh-r-lg)' }}>
                    <h5 className="mb-3" style={{ fontSize: '0.8rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--sh-muted)' }}>
                      Select Date
                    </h5>
                    <DatePickerInline value={date} min={todayLocal()} onChange={onDateChange} />
                  </div>
                </Reveal>

                <Reveal delay={70}>
                  <div className="card p-4" style={{ borderRadius: 'var(--sh-r-lg)' }}>
                    <h5 className="mb-3" style={{ fontSize: '0.8rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--sh-muted)' }}>
                      Select Time
                    </h5>
                    {slotsError ? (
                      <ErrorState message={slotsError} onRetry={() => loadSlots(court, date)} />
                    ) : (
                      <TimeSlotGridInline slots={slots} value={startTime} onSelect={setStartTime} loading={slotsLoading} />
                    )}
                    <p className="text-muted small mb-0 mt-3">
                      <span className="visually-hidden">Keterangan status slot: </span>
                    </p>
                    <ul className="slot-legend mt-3" aria-label="Keterangan status slot">
                      <li><span className="slot-swatch is-available" aria-hidden="true" /><span>Tersedia — garis tegas, bisa dipilih</span></li>
                      <li><span className="slot-swatch is-selected" aria-hidden="true" /><span>Dipilih — terisi penuh</span></li>
                      <li><span className="slot-swatch is-unavailable" aria-hidden="true" /><span>Terisi/lewat — garis putus-putus, nonaktif</span></li>
                    </ul>
                  </div>
                </Reveal>

                <Reveal delay={120}>
                  <div className="card p-4" style={{ borderRadius: 'var(--sh-r-lg)' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0" style={{ fontSize: '0.8rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--sh-muted)' }}>
                        Duration
                      </h5>
                      <div className="filter-pills">
                        {[1, 2, 3].map((h) => (
                          <button
                            key={h}
                            type="button"
                            className={`filter-pill ${duration === h ? 'active' : ''}`}
                            disabled={!startTime}
                            onClick={() => setDuration(h)}
                            aria-pressed={duration === h}
                          >
                            {h} jam
                          </button>
                        ))}
                      </div>
                    </div>
                    {!startTime && <p className="text-muted small mb-0">Pilih jam mulai untuk mengatur durasi.</p>}
                  </div>
                </Reveal>

                {submitError && (
                  <div ref={submitErrorRef} tabIndex={-1} role="alert" className="alert alert-danger mb-0">
                    <strong className="d-block mb-1">Booking gagal dibuat</strong>
                    {submitError}
                  </div>
                )}

                <BookingSummaryInline
                  court={court}
                  date={date}
                  startTime={startTime}
                  endTime={endTime}
                  duration={duration}
                  total={totalPrice}
                  submitting={submitting}
                  onSubmit={submit}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
