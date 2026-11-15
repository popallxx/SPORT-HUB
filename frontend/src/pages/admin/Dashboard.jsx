import { useEffect, useState } from 'react'
import api from '../../services/api'
import StatCard from '../../components/StatCard'
import StatusBadge from '../../components/StatusBadge'
import ErrorState from '../../components/ErrorState'
import Reveal from '../../components/Reveal'
import { useToast } from '../../context/ToastContext'
import { StatSkeleton, TableSkeleton } from '../../components/Skeleton'
import { formatPrice, formatTime, greeting, todayLocal } from '../../utils/format'

function last7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    days.push(`${y}-${m}-${day}`)
  }
  return days
}

const dayLabel = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('id-ID', { weekday: 'short' })
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const toast = useToast()
  const [userName] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('sporthub_user'))
      return u?.name?.split(' ')[0] || 'Admin'
    } catch {
      return 'Admin'
    }
  })

  const load = () => {
    Promise.all([api.get('/admin/dashboard'), api.get('/admin/bookings')])
      .then(([s, b]) => {
        setStats(s.data.data)
        setBookings(b.data.data)
        setError('')
        setLoading(false)
      })
      .catch(() => {
        setError('Gagal memuat data dashboard')
        setLoading(false)
      })
  }

  useEffect(load, [])

  if (loading) {
    return (
      <div>
        <div className="mb-4">
          <div className="skeleton skeleton-line lg" style={{ width: 280 }} />
          <div className="skeleton skeleton-line sm mt-2" style={{ width: 180 }} />
        </div>
        <div className="row g-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="col-md-6 col-xl-3">
              <StatSkeleton />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <TableSkeleton rows={4} />
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <ErrorState
        message={error || 'Gagal memuat data dashboard'}
        onRetry={() => {
          setLoading(true)
          load()
        }}
      />
    )
  }

  const days = last7Days()
  const byDay = {}
  days.forEach((d) => (byDay[d] = 0))
  bookings.forEach((b) => {
    if (byDay[b.booking_date] !== undefined) byDay[b.booking_date]++
  })
  const maxCount = Math.max(1, ...Object.values(byDay))

  const todayBookings = bookings
    .filter((b) => b.booking_date === todayLocal())
    .sort((a, b) => a.start_time.localeCompare(b.start_time))

  const changeStatus = async (booking, status) => {
    try {
      const res = await api.put(`/admin/bookings/${booking.id}`, { status })
      toast.success(res.data?.message || `Booking ${booking.booking_code} -> ${status}`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah status')
    }
  }

  const statusRows = [
    { label: 'Confirmed', value: stats.bookings_confirmed, color: 'var(--sh-success)' },
    { label: 'Completed', value: stats.bookings_completed, color: 'var(--sh-info)' },
    { label: 'Cancelled', value: stats.bookings_cancelled, color: 'var(--sh-danger)' },
  ]
  const totalStatus = Math.max(1, statusRows.reduce((acc, s) => acc + s.value, 0))

  return (
    <div className="page-fade">
      <div className="page-head">
        <span className="eyebrow">Facility management</span>
        <h1 className="page-title mt-2">
          {greeting()}, <span className="text-accent">{userName}</span>
        </h1>
        <p className="section-subtitle mb-0">Ringkasan operasional SportHub.</p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6 col-xl-3">
          <Reveal>
            <StatCard icon="calendar" label="Total bookings" value={stats.total_bookings} />
          </Reveal>
        </div>
        <div className="col-md-6 col-xl-3">
          <Reveal delay={70}>
            <StatCard icon="users" label="Total users" value={stats.total_users} />
          </Reveal>
        </div>
        <div className="col-md-6 col-xl-3">
          <Reveal delay={140}>
            <StatCard icon="shuttle" label="Total courts" value={stats.total_courts} />
          </Reveal>
        </div>
        <div className="col-md-6 col-xl-3">
          <Reveal delay={210}>
            <StatCard icon="clock" label="Pending bookings" value={stats.bookings_pending} accent />
          </Reveal>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-xl-8">
          <div className="card p-4 h-100">
            <h2 className="admin-section-title">Booking activity</h2>
            <p className="text-muted small mb-4">7 hari terakhir</p>
            <div
              className="activity-chart"
              role="img"
              aria-label={`Aktivitas booking 7 hari terakhir. Total ${Object.values(byDay).reduce((a, b) => a + b, 0)} booking. Tertinggi ${maxCount} booking per hari.`}
            >
              {days.map((d) => (
                <div key={d} className="activity-col">
                  <span className="activity-value" aria-hidden="true">{byDay[d]}</span>
                  <div
                    className={`activity-bar ${byDay[d] === 0 ? 'zero' : ''}`}
                    style={{ height: `${Math.max(6, (byDay[d] / maxCount) * 100)}%` }}
                    title={`${dayLabel(d)}: ${byDay[d]} booking`}
                  />
                  <span className="activity-day" aria-hidden="true">{dayLabel(d)}</span>
                </div>
              ))}
            </div>
            <ul className="visually-hidden">
              {days.map((d) => (
                <li key={d}>{dayLabel(d)} {d}: {byDay[d]} booking</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="card p-4 h-100">
            <h2 className="admin-section-title mb-4">Booking status</h2>
            <div className="d-flex flex-column gap-4">
              {statusRows.map((s) => (
                <div key={s.label}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="admin-status-label">{s.label}</span>
                    <span className="text-accent fw-bold">{s.value}</span>
                  </div>
                  <div className="status-bar-track">
                    <div
                      className="status-bar-fill"
                      style={{ width: `${(s.value / totalStatus) * 100}%`, background: s.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="admin-section-title mb-0">Today's bookings</h2>
          <span className="type-pill">{todayBookings.length} booking</span>
        </div>

        {todayBookings.length === 0 ? (
          <div className="state-box" style={{ padding: '48px 24px' }}>
            <h3 className="admin-section-title">Belum ada booking hari ini</h3>
            <p className="state-desc mb-0">Booking yang masuk hari ini akan muncul di sini.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Court</th>
                  <th>Time</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {todayBookings.map((b) => (
                  <tr key={b.id}>
                    <td className="fw-semibold">{b.user?.name}</td>
                    <td>
                      {b.court?.name}
                      <span className="text-muted small"> ({b.court?.type})</span>
                    </td>
                    <td>
                      {formatTime(b.start_time)} - {formatTime(b.end_time)}
                    </td>
                    <td className="fw-semibold">{formatPrice(b.total_price)}</td>
                    <td>
                      <StatusBadge status={b.status} />
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={b.status}
                        onChange={(e) => changeStatus(b, e.target.value)}
                        aria-label={`Ubah status booking ${b.booking_code}`}
                        disabled={['completed', 'cancelled'].includes(b.status)}
                        title={
                          ['completed', 'cancelled'].includes(b.status)
                            ? 'Status akhir — tidak dapat diubah lagi'
                            : undefined
                        }
                        style={{ width: 160 }}
                      >
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
                        <option value="completed">completed</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}