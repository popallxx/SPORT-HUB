import Icon from './Icon'

export default function ErrorState({ title = 'Something went wrong', message, onRetry, retryLabel = 'Try Again' }) {
  return (
    <div className="state-box">
      <div className="state-icon danger">
        <Icon name="refresh" size={28} />
      </div>
      <h3 className="state-title">{title}</h3>
      <p className="state-desc">{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-accent" onClick={onRetry}>
          <Icon name="refresh" size={16} />
          {retryLabel}
        </button>
      )}
    </div>
  )
}