export default function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="page-head">
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3">
        <div>
          {eyebrow && <span className="eyebrow mb-2">{eyebrow}</span>}
          <h1 className="page-title mt-1">{title}</h1>
          {subtitle && <p className="section-subtitle mb-0">{subtitle}</p>}
        </div>
        {actions && <div className="d-flex gap-2">{actions}</div>}
      </div>
    </div>
  )
}