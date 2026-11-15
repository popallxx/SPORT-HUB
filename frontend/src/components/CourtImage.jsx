import { useState } from 'react'
import Icon from './Icon'

export default function CourtImage({ court, className = '', icon, style }) {
  const [broken, setBroken] = useState(false)

  const hasImage = court?.image && !broken

  if (hasImage) {
    return (
      <div className={`court-visual ${className}`} style={style}>
        <img
          src={court.image}
          alt={court.name || 'Lapangan olahraga'}
          loading="lazy"
          onError={() => setBroken(true)}
        />
        <div className="court-line-overlay" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div className={`court-visual ${className}`} style={style} aria-label={`Placeholder ${court?.name || 'lapangan'}`}>
      <div className="court-placeholder">
        <span className="ph-icon">
          <Icon name={icon || court?.sport_icon || 'shuttle'} size={44} strokeWidth={1.5} />
        </span>
        <span className="ph-label">{court?.type || 'SportHub'}</span>
      </div>
      <div className="court-line-overlay" aria-hidden="true" />
    </div>
  )
}