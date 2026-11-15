import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('SportHub render error:', error, info)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleClearSession = () => {
    try {
      localStorage.removeItem('sporthub_user')
      localStorage.removeItem('sporthub_token')
    } catch {
      // localStorage bisa diblokir; tetap arahkan ke halaman utama.
    }
    window.location.assign('/')
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: '100vh', padding: 24 }}
        role="alert"
      >
        <div className="card p-4 text-center" style={{ width: '100%', maxWidth: 520 }}>
          <span className="eyebrow justify-content-center mb-3">SportHub</span>
          <h1 className="page-title mb-2">Terjadi kesalahan</h1>
          <p className="text-muted mb-4">
            Halaman gagal ditampilkan. Coba muat ulang, atau bersihkan sesi jika masalah berlanjut.
          </p>
          <div className="d-flex flex-wrap justify-content-center gap-2">
            <button type="button" className="btn btn-accent" onClick={this.handleReload}>
              Muat ulang
            </button>
            <button type="button" className="btn btn-ghost" onClick={this.handleClearSession}>
              Bersihkan sesi
            </button>
          </div>
        </div>
      </div>
    )
  }
}
