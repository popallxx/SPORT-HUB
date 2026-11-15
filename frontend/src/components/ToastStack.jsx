import Icon from './Icon'

const ICON_BY_TYPE = {
  success: 'check',
  error: 'close',
  warning: 'clock',
  info: 'pin',
}

export default function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="sh-toasts" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <div key={t.id} className={`sh-toast sh-toast-${t.type}`} role="status">
          <span className="sh-toast-icon" aria-hidden="true">
            <Icon name={ICON_BY_TYPE[t.type] || 'pin'} size={17} strokeWidth={2.4} />
          </span>
          <span className="sh-toast-msg">{t.message}</span>
          <button
            type="button"
            className="sh-toast-close"
            onClick={() => onDismiss(t.id)}
            aria-label="Tutup notifikasi"
          >
            <Icon name="close" size={14} strokeWidth={2.5} />
          </button>
        </div>
      ))}
    </div>
  )
}
