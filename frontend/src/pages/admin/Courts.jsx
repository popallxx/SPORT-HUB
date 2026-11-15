import { useEffect, useState, useRef } from 'react'
import api from '../../services/api'
import CourtImage from '../../components/CourtImage'
import EmptyState from '../../components/EmptyState'
import ErrorState from '../../components/ErrorState'
import Icon from '../../components/Icon'
import PageHeader from '../../components/PageHeader'
import Reveal from '../../components/Reveal'
import ConfirmModal from '../../components/ConfirmModal'
import { useToast } from '../../context/ToastContext'
import { CourtGridSkeleton } from '../../components/Skeleton'
import { formatPrice, statusLabel, statusTone } from '../../utils/format'

function ModalInline({ open, title, onClose, children, footer }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return

    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && ref.current) {
        const focusables = ref.current.querySelectorAll('button, input, select, textarea, [href]')
        if (focusables.length) {
          const first = focusables[0]
          const last = focusables[focusables.length - 1]
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault()
            last.focus()
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="sh-modal-backdrop" onClick={onClose}>
      <div
        ref={ref}
        className="sh-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sh-modal-header">
          <h5>{title}</h5>
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Tutup">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="sh-modal-body">{children}</div>
        {footer && <div className="sh-modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

const emptyForm = { name: '', type: '', price: '', description: '', image: '', status: 'active' }

export default function AdminCourts() {
  const [courts, setCourts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const toast = useToast()

  const load = () => {
    api
      .get('/admin/courts')
      .then((res) => {
        setCourts(res.data.data)
        setError('')
        setLoading(false)
      })
      .catch(() => {
        setError('Gagal memuat lapangan')
        setLoading(false)
      })
  }

  useEffect(load, [])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (court) => {
    setEditing(court)
    setForm({
      name: court.name,
      type: court.type,
      price: court.price,
      description: court.description || '',
      image: court.image || '',
      status: court.status,
    })
    setShowModal(true)
  }

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editing) {
        await api.put(`/admin/courts/${editing.id}`, form)
        toast.success(`Lapangan ${form.name} diperbarui`)
      } else {
        await api.post('/admin/courts', form)
        toast.success(`Lapangan ${form.name} ditambahkan`)
      }
      setShowModal(false)
      load()
    } catch (err) {
      const errors = err.response?.data?.errors
      let msg = err.response?.data?.message || 'Gagal menyimpan lapangan'
      if (errors) {
        msg = Object.values(errors)[0]?.[0] || 'Validasi gagal'
      }
      setError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const doDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await api.delete(`/admin/courts/${pendingDelete.id}`)
      toast.success(`Lapangan ${pendingDelete.name} dihapus`)
      setPendingDelete(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus lapangan')
    } finally {
      setDeleting(false)
    }
  }

  const remove = (court) => {
    if (court.bookings_count > 0) return
    setPendingDelete(court)
  }

  return (
    <div className="page-fade">
      <PageHeader
        eyebrow="Facility management"
        title="Courts"
        subtitle="Kelola lapangan dan ketersediaannya."
        actions={
          <button type="button" className="btn btn-accent" onClick={openAdd}>
            <Icon name="plus" size={17} />
            Tambah lapangan
          </button>
        }
      />

      {!loading && !error && courts.length > 0 && (
        <p className="admin-meta mb-4">
          {courts.length} lapangan · {courts.filter((c) => c.status === 'active').length} aktif
        </p>
      )}

      {loading ? (
        <CourtGridSkeleton count={6} />
      ) : error && courts.length === 0 ? (
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
          title="Belum ada lapangan"
          message="Tambahkan lapangan pertamamu untuk mulai menerima booking."
          action={
            <button type="button" className="btn btn-accent" onClick={openAdd}>
              <Icon name="plus" size={16} />
              Tambah lapangan
            </button>
          }
        />
      ) : (
        <div className="row g-4">
          {courts.map((c, i) => (
            <div key={c.id} className="col-md-6 col-xl-4">
              <Reveal delay={(i % 3) * 70} className="h-100">
                <div className="card card-hover court-card h-100">
                <CourtImage court={c} className="flex-shrink-0" style={{ aspectRatio: '16/9' }} />
                <div className="court-card-body">
                  <span className="type-pill align-self-start">{c.type}</span>
                  <h3 className="court-card-title">{c.name}</h3>
                  {c.description && <p className="court-card-desc">{c.description}</p>}
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <div className="court-card-price">
                      {formatPrice(c.price)} <span>/ jam</span>
                    </div>
                    <span className={`status-badge status-${statusTone(c.status === 'active' ? 'confirmed' : 'cancelled')}`}>
                      {statusLabel(c.status)}
                    </span>
                  </div>
                  <div className="d-flex gap-2 mt-auto">
                    <button type="button" className="btn btn-ghost flex-grow-1" onClick={() => openEdit(c)}>
                      <Icon name="edit" size={15} />
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger flex-grow-1"
                      onClick={() => remove(c)}
                      disabled={c.bookings_count > 0}
                      title={
                        c.bookings_count > 0
                          ? `Tidak bisa dihapus: sudah ada ${c.bookings_count} booking. Nonaktifkan lapangan ini sebagai gantinya.`
                          : undefined
                      }
                    >
                      <Icon name="trash" size={15} />
                      Delete
                    </button>
                  </div>
                  {c.bookings_count > 0 && (
                    <p className="court-card-note">
                      Sudah ada {c.bookings_count} booking — tidak bisa dihapus. Nonaktifkan saja.
                    </p>
                  )}
                </div>
              </div>
              </Reveal>
            </div>
          ))}
        </div>
      )}

      <ModalInline
        open={showModal}
        title={editing ? 'Edit Court' : 'Add Court'}
        onClose={() => setShowModal(false)}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
              Batal
            </button>
            <button type="submit" form="court-form" className="btn btn-accent" disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </>
        }
      >
        {error && <div className="alert alert-danger">{error}</div>}
        <form id="court-form" onSubmit={save}>
          <div className="mb-3">
            <label className="form-label" htmlFor="court-name">Nama</label>
            <input id="court-name" name="name" className="form-control" value={form.name} onChange={onChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="court-type">Jenis Olahraga</label>
            <input id="court-type" name="type" className="form-control" placeholder="Badminton / Futsal" value={form.type} onChange={onChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="court-price">Harga per Jam (Rp)</label>
            <input id="court-price" name="price" type="number" min="0" className="form-control" value={form.price} onChange={onChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="court-desc">Deskripsi</label>
            <textarea id="court-desc" name="description" className="form-control" rows="3" value={form.description} onChange={onChange}></textarea>
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="court-image">URL Gambar (opsional)</label>
            <input id="court-image" name="image" className="form-control" value={form.image} onChange={onChange} placeholder="https://..." />
          </div>
          <div className="mb-0">
            <label className="form-label" htmlFor="court-status">Status</label>
            <select id="court-status" name="status" className="form-select" value={form.status} onChange={onChange}>
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </div>
        </form>
      </ModalInline>

      <ConfirmModal
        open={!!pendingDelete}
        title="Hapus lapangan?"
        message={
          pendingDelete
            ? `Hapus lapangan "${pendingDelete.name}" secara permanen? Tindakan ini tidak bisa dibatalkan. Kalau ingin menyimpan riwayat booking, nonaktifkan lapangan saja.`
            : ''
        }
        confirmLabel="Ya, hapus"
        danger
        loading={deleting}
        onConfirm={doDelete}
        onClose={() => {
          if (!deleting) setPendingDelete(null)
        }}
      />
    </div>
  )
}
