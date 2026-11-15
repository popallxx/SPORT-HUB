import { Link } from 'react-router-dom'
import CourtImage from './CourtImage'
import Icon from './Icon'
import { formatPrice } from '../utils/format'

export default function CourtCard({ court }) {
  return (
    <div className="card card-hover court-card h-100">
      <CourtImage court={court} className="flex-shrink-0" />
      <div className="court-card-body">
        <div className="d-flex justify-content-between align-items-center gap-2">
          <h3 className="court-card-title">{court.name}</h3>
          <span className="type-pill">{court.type}</span>
        </div>
        <div className="d-flex justify-content-between align-items-center gap-2">
          <div className="court-card-price">
            {formatPrice(court.price)} <span>/ jam</span>
          </div>
          <span className={`status-badge ${court.status === 'active' ? 'status-success' : 'status-neutral'}`}>
            {court.status === 'active' ? 'AVAILABLE' : 'NOT ACTIVE'}
          </span>
        </div>
        <Link to={`/courts/${court.id}`} className="btn btn-accent mt-auto">
          BOOK NOW
          <Icon name="arrowRight" size={16} />
        </Link>
      </div>
    </div>
  )
}