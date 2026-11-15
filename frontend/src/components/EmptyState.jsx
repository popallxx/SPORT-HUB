import Icon from './Icon'

export default function EmptyState({ icon = 'shuttle', title, message, action }) {
  return (
    <div className="state-box">
      <div className="state-icon">
        <Icon name={icon} size={28} />
      </div>
      <h3 className="state-title">{title}</h3>
      <p className="state-desc">{message}</p>
      {action}
    </div>
  )
}