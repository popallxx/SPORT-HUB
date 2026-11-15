export function formatPrice(price) {
  return 'Rp' + Number(price || 0).toLocaleString('id-ID')
}

export function parseDate(dateStr) {
  if (!dateStr) return null
  const d = dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'T00:00:00')
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatDate(dateStr) {
  const d = parseDate(dateStr)
  if (!d) return dateStr || '-'
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatShortDate(dateStr) {
  const d = parseDate(dateStr)
  if (!d) return dateStr || '-'
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatTime(timeStr) {
  if (!timeStr) return '-'
  return timeStr.slice(0, 5)
}

export function statusLabel(status) {
  const map = {
    pending: 'Menunggu Pembayaran',
    confirmed: 'Terkonfirmasi',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  }
  return map[status] || status
}

export function statusTone(status) {
  const map = {
    pending: 'warning',
    confirmed: 'success',
    completed: 'info',
    cancelled: 'danger',
  }
  return map[status] || 'neutral'
}

export function canCancelBooking(booking) {
  if (!booking) return false
  if (!['pending', 'confirmed'].includes(booking.status)) return false

  const date = String(booking.booking_date || '').slice(0, 10)
  const start = String(booking.start_time || '').slice(0, 5)

  if (!date || !start) return false

  return new Date(`${date}T${start}:00`) > new Date()
}

export function todayLocal() {
  const d = new Date()
  const offset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - offset).toISOString().slice(0, 10)
}

export function greeting() {
  const h = new Date().getHours()
  if (h < 11) return 'Good Morning'
  if (h < 19) return 'Good Afternoon'
  return 'Good Evening'
}

export function firstLetter(name) {
  return (name || '?').charAt(0).toUpperCase()
}
