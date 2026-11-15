import { statusLabel, statusTone } from '../utils/format'

export default function StatusBadge({ status }) {
  return <span className={`status-badge status-${statusTone(status)}`}>{statusLabel(status)}</span>
}