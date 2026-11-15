import { useTheme } from '../context/ThemeContext'
import Icon from './Icon'

export default function ThemeToggle({ compact = false }) {
  const { theme, toggle, isLight } = useTheme()

  return (
    <button
      type="button"
      className={`theme-toggle ${compact ? 'theme-toggle-compact' : ''}`}
      onClick={toggle}
      aria-label={isLight ? 'Ganti ke dark mode' : 'Ganti ke light mode'}
      aria-pressed={isLight}
      title={isLight ? 'Dark mode' : 'Light mode'}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-thumb">
          <Icon name={isLight ? 'sun' : 'moon'} size={15} strokeWidth={2.2} />
        </span>
      </span>
      {!compact && (
        <span className="theme-toggle-label">{theme === 'light' ? 'Light' : 'Dark'}</span>
      )}
    </button>
  )
}
