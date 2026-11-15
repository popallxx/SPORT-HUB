import { useEffect, useMemo, useState } from 'react'
import api from '../../services/api'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'
import ErrorState from '../../components/ErrorState'
import Icon from '../../components/Icon'
import ConfirmModal from '../../components/ConfirmModal'
import { useToast } from '../../context/ToastContext'
import { TableSkeleton } from '../../components/Skeleton'
import { firstLetter, formatDate } from '../../utils/format'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [pendingRole, setPendingRole] = useState(null)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  const load = () => {
    api
      .get('/admin/users')
      .then((res) => {
        setUsers(res.data.data)
        setError('')
        setLoading(false)
      })
      .catch(() => {
        setError('Gagal memuat user')
        setLoading(false)
      })
  }

  useEffect(load, [])

  const doChangeRole = async () => {
    if (!pendingRole) return
    setSaving(true)
    try {
      await api.put(`/admin/users/${pendingRole.user.id}`, { role: pendingRole.role })
      toast.success(`Role ${pendingRole.user.name} -> ${pendingRole.role}`)
      setPendingRole(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah role')
    } finally {
      setSaving(false)
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q),
    )
  }, [users, query])

  return (
    <div className="page-fade">
      <PageHeader eyebrow="User Management" title="Users" subtitle="Kelola pengguna SportHub." />

      <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center mb-4">
        <p className="text-muted small mb-0">{filtered.length} pengguna</p>
        <div className="sh-search">
          <span className="sh-search-icon" aria-hidden="true">
            <Icon name="search" size={16} />
          </span>
          <input
            type="search"
            className="form-control"
            placeholder="Cari nama, email, role..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Cari pengguna"
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
          icon={query ? 'search' : 'users'}
          title={query ? 'Pengguna tidak ditemukan' : 'Belum ada pengguna'}
          message={query ? `Tidak ada hasil untuk “${query}”.` : 'Belum ada pengguna terdaftar.'}
          action={
            query ? (
              <button type="button" className="btn btn-ghost" onClick={() => setQuery('')}>
                <Icon name="refresh" size={16} />
                Atur ulang
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setLoading(true)
                  load()
                }}
              >
                <Icon name="refresh" size={16} />
                Muat ulang
              </button>
            )
          }
        />
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Total Booking</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span className="nav-avatar">{firstLetter(u.name)}</span>
                      <span className="fw-semibold">{u.name}</span>
                    </div>
                  </td>
                  <td className="text-muted">{u.email}</td>
                  <td>
                    <span className={`status-badge ${u.role === 'admin' ? 'status-warning' : 'status-info'}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td>{formatDate(u.created_at)}</td>
                  <td>{u.bookings_count}</td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={u.role}
                      onChange={(e) => {
                        if (e.target.value !== u.role) setPendingRole({ user: u, role: e.target.value })
                      }}
                      aria-label={`Ubah role ${u.name}`}
                      style={{ width: 140 }}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!pendingRole}
        title="Ubah role?"
        message={
          pendingRole
            ? `Ubah role ${pendingRole.user.name} (${pendingRole.user.email}) menjadi ${pendingRole.role}?`
            : ''
        }
        confirmLabel="Ya, ubah"
        loading={saving}
        onConfirm={doChangeRole}
        onClose={() => {
          if (!saving) setPendingRole(null)
        }}
      />
    </div>
  )
}
