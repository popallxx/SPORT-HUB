import { useEffect, useRef } from 'react'
import Icon from './Icon'

export default function ConfirmModal({
  open,
  title = 'Konfirmasi',
  message = 'Apakah kamu yakin?',
  confirmLabel = 'Ya, lanjutkan',
  cancelLabel = 'Batal',
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}) {
  const cancelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape' && !loading) onClose?.()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    cancelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, loading, onClose])

  if (!open) return null

  return (
    <div
      className="sh-modal-backdrop"
      onClick={() => {
        if (!loading) onClose?.()
      }}
    >
      <div
        className="sh-modal sh-modal-sm"
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sh-modal-header">
          <h5>{title}</h5>
          <button
            type="button"
            className="btn btn-ghost btn-icon btn-sm"
            onClick={onClose}
            disabled={loading}
            aria-label="Tutup dialog"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
        <div className="sh-modal-body">
          <p className="text-muted mb-0" style={{ lineHeight: 1.65 }}>
            {message}
          </p>
        </div>
        <div className="sh-modal-footer">
          <button ref={cancelRef} type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${danger ? 'btn-danger' : 'btn-accent'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                />
                Memproses...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
