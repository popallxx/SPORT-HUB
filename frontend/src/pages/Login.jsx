import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import AuthLayout from '../components/AuthLayout'
import Icon from '../components/Icon'
import BrandMark from '../components/BrandMark'

export default function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const errorRef = useRef(null)

  useEffect(() => {
    if (error) errorRef.current?.focus()
  }, [error])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const user = await login(form.email, form.password)
      toast.success(`Selamat datang kembali, ${user.name?.split(' ')[0] || 'Player'}!`)
      navigate(user.role === 'admin' ? '/admin' : '/')
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Tidak dapat terhubung ke server. Pastikan backend berjalan di http://127.0.0.1:8000.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <div className="auth-form-wrap sh-reveal">
        <div className="d-flex align-items-center gap-2 mb-4 d-lg-none">
          <BrandMark />
          <span className="fw-bold" style={{ letterSpacing: '0.14em' }}>SPORT HUB</span>
        </div>
        <div className="auth-card">
          <h1 className="fw-bolder mb-1" style={{ fontSize: '1.7rem' }}>Welcome back.</h1>
          <p className="text-muted mb-4">Masuk untuk melanjutkan ke bookingmu.</p>

          {error && (
            <div ref={errorRef} tabIndex={-1} role="alert" aria-labelledby="login-error-title" className="alert alert-danger">
              <strong id="login-error-title" className="d-block mb-1">Login gagal</strong>
              {error}
            </div>
          )}

          <form onSubmit={submit} noValidate={false}>
            <div className="mb-3">
              <label className="form-label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                name="email"
                className="form-control"
                placeholder="nama@email.com"
                value={form.email}
                onChange={onChange}
                required
                autoComplete="email"
                aria-describedby={error ? 'login-error-title' : undefined}
              />
            </div>
            <div className="mb-4">
              <label className="form-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                name="password"
                className="form-control"
                placeholder="••••••••"
                value={form.password}
                onChange={onChange}
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="btn btn-accent w-100 btn-lg" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ borderColor: '#0b0f14 transparent #0b0f14 #0b0f14' }} />
                  Memproses...
                </>
              ) : (
                <>
                  LOGIN
                  <Icon name="arrowRight" size={17} />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-4 mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
            Belum punya akun?{' '}
            <Link to="/register" className="fw-bold">Daftar sekarang</Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}