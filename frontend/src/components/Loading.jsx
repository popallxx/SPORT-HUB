export default function Loading({ full = false }) {
  return (
    <div
      className={`d-flex justify-content-center align-items-center ${full ? 'min-vh-100' : 'py-5'}`}
    >
      <div className="spinner-border" role="status" style={{ color: 'var(--sh-accent)' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  )
}