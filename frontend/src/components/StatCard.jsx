import Icon from './Icon'

export default function StatCard({ icon, label, value, accent = false }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon name={icon} size={20} />
      </div>
      <div className={`stat-value ${accent ? 'accent' : ''}`}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}