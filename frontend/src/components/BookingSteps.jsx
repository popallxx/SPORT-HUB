/* eslint-disable react-refresh/only-export-components */
import Icon from './Icon'

export const BOOKING_STEPS_FULL = [
  { num: '01', label: 'Court' },
  { num: '02', label: 'Date' },
  { num: '03', label: 'Time' },
  { num: '04', label: 'Summary' },
  { num: '05', label: 'Payment' },
]

export default function BookingSteps({ steps = BOOKING_STEPS_FULL, currentStep = 0 }) {
  const total = steps.length
  const clamped = Math.max(0, Math.min(currentStep, total))

  return (
    <div className="booking-steps" aria-label="Booking progress">
      {steps.map((step, i) => {
        let cls = 'booking-step'
        if (i < clamped) cls += ' done'
        else if (i === clamped) cls += ' active'

        return (
          <div key={step.num} style={{ display: 'flex', alignItems: 'center' }}>
            <div className={cls} aria-current={i === clamped ? 'step' : undefined}>
              <span className="booking-step-num">
                {i < clamped ? (
                  <Icon name="check" size={16} strokeWidth={3} />
                ) : (
                  step.num
                )}
              </span>
              <span className="booking-step-label">{step.label}</span>
            </div>
            {i < total - 1 && (
              <div className={`booking-step-line ${i < clamped ? 'done' : ''}`} aria-hidden="true" />
            )}
          </div>
        )
      })}
    </div>
  )
}
