export function CourtCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-block" style={{ borderRadius: 0 }} />
      <div className="skeleton-body">
        <div className="skeleton skeleton-line sm" />
        <div className="skeleton skeleton-line lg" />
        <div className="skeleton skeleton-line" />
      </div>
    </div>
  )
}

export function StatSkeleton() {
  return (
    <div className="skeleton-stat">
      <div className="skeleton skeleton-line sm" style={{ width: 42, height: 42, borderRadius: 8 }} />
      <div className="skeleton skeleton-line lg mt-3" style={{ marginTop: 16 }} />
      <div className="skeleton skeleton-line sm mt-2" style={{ marginTop: 10 }} />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="table-responsive">
      <table className="table align-middle">
        <thead>
          <tr>
            {Array.from({ length: 5 }).map((_, i) => (
              <th key={i} style={{ width: '18%' }}>
                <div className="skeleton skeleton-line" style={{ height: 12 }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: 5 }).map((_, c) => (
                <td key={c}>
                  <div className="skeleton skeleton-line" style={{ height: 12, width: c === 0 ? '55%' : '80%' }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ListSkeleton({ count = 3 }) {
  return (
    <div className="d-flex flex-column gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card p-3" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div className="skeleton" style={{ width: 56, height: 56, borderRadius: 12, flexShrink: 0 }} />
          <div className="flex-grow-1 d-flex flex-column gap-2">
            <div className="skeleton skeleton-line lg" />
            <div className="skeleton skeleton-line sm" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function CourtGridSkeleton({ count = 3 }) {
  return (
    <div className="row g-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="col-md-6 col-lg-4">
          <CourtCardSkeleton />
        </div>
      ))}
    </div>
  )
}