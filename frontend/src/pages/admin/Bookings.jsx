import { useEffect, useMemo, useState } from 'react'
import api from '../../services/api'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import EmptyState from '../../components/EmptyState'
import ErrorState from '../../components/ErrorState'
import Icon from '../../components/Icon'
import { useToast } from '../../context/ToastContext'
import { TableSkeleton } from '../../components/Skeleton'
import { formatDate, formatPrice, formatShortDate, formatTime, statusLabel } from '../../utils/format'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const toast = useToast()
  const PAGE_SIZE = 8

  const load = () => {
    api
      .get('/admin/bookings')
      .then((res) => {
        setBookings(res.data.data)
        setError('')
        setLoading(false)
      })
      .catch(() => {
        setError('Gagal memuat booking')
        setLoading(false)
      })
  }

  useEffect(load, [])

  const changeStatus = async (booking, status) => {
    try {
      const res = await api.put(`/admin/bookings/${booking.id}`, { status })
      toast.success(res.data?.message || `Booking ${booking.booking_code} -> ${status}`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah status')
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return bookings.filter((b) => {
      const matchStatus = filter === 'all' || b.status === filter
      const matchQuery =
        !q ||
        b.booking_code?.toLowerCase().includes(q) ||
        b.user?.name?.toLowerCase().includes(q) ||
        b.court?.name?.toLowerCase().includes(q)
      return matchStatus && matchQuery
    })
  }, [bookings, filter, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const setFilterAndReset = (f) => {
    setFilter(f)
    setPage(1)
  }

  return (
    <div className="page-fade">
      <PageHeader eyebrow="Booking Management" title="Bookings" subtitle="Kelola semua booking di SportHub." />

      <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center mb-4">
        <div className="filter-pills segmented">
          {FILTERS.map((f) => {
            const count = f.key === 'all' ? bookings.length : bookings.filter((b) => b.status === f.key).length
            return (
              <button
                key={f.key}
                type="button"
                className={`filter-pill ${filter === f.key ? 'active' : ''}`}
                onClick={() => setFilterAndReset(f.key)}
                aria-pressed={filter === f.key}
              >
                {f.label}
                <span className="pill-count">{count}</span>
              </button>
            )
          })}
        </div>
        <div className="sh-search">
          <span className="sh-search-icon" aria-hidden="true">
            <Icon name="search" size={16} />
          </span>
          <input
            type="search"
            className="form-control"
            placeholder="Cari kode, user, court..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            aria-label="Cari booking"
          />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={() => {
            setLoading(true)
            load()
          }}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={query ? 'search' : 'calendar'}
          title="Belum ada booking"
          message={
            query
              ? `Tidak ada hasil untuk “${query}”.`
              : filter === 'all'
                ? 'Belum ada booking masuk.'
                : `Belum ada booking berstatus ${statusLabel(filter)}.`
          }
          action={
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setQuery('')
                setFilterAndReset('all')
                setLoading(true)
                load()
              }}
            >
              <Icon name="refresh" size={16} />
              Reset &amp; muat ulang
            </button>
          }
        />
      ) : (
        <>
          <p className="text-muted small mb-3">
            Menampilkan {paged.length} dari {filtered.length} booking &middot; halaman {safePage}/{totalPages}
          </p>
          <div className="table-responsive d-none d-xxl-block">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Nomor</th>
                  <th>User</th>
                  <th>Court</th>
                  <th>Tanggal</th>
                  <th>Jam</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((b) => (
                  <tr key={b.id}>
                    <td className="fw-semibold">{b.booking_code}</td>
                    <td>{b.user?.name}</td>
                    <td>
                      {b.court?.name}
                      <span className="text-muted small"> ({b.court?.type})</span>
                    </td>
                    <td>{formatDate(b.booking_date)}</td>
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

          <div className="d-flex flex-column gap-3 d-xxl-none">
            {paged.map((b) => (
              <div key={b.id} className="booking-row-card">
                <div className="d-flex justify-content-between align-items-center gap-2">
                  <span className="fw-semibold">{b.booking_code}</span>
                  <StatusBadge status={b.status} />
                </div>
                <div>
                  <div className="fw-semibold">{b.user?.name}</div>
                  <div className="text-muted small">
                    {b.court?.name} ({b.court?.type})
                  </div>
                  <div className="text-muted small">
                    {formatShortDate(b.booking_date)} &middot; {formatTime(b.start_time)} - {formatTime(b.end_time)}
                  </div>
                </div>
                <div className="fw-semibold">{formatPrice(b.total_price)}</div>
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
                >
                  <option value="pending">pending</option>
                  <option value="confirmed">confirmed</option>
                  <option value="completed">completed</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={safePage <= 1}
                onClick={() => setPage(safePage - 1)}
              >
                <Icon name="chevronLeft" size={15} />
                Prev
              </button>
              <span className="text-muted small fw-semibold">
                {safePage} / {totalPages}
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={safePage >= totalPages}
                onClick={() => setPage(safePage + 1)}
              >
                Next
                <Icon name="chevronRight" size={15} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}