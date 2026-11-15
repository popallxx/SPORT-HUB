import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import AuthLayout from '../components/AuthLayout'
import Icon from '../components/Icon'
import BrandMark from '../components/BrandMark'

export default function Register() {
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const errorRef = useRef(null)

  useEffect(() => {
    if (error) errorRef.current?.focus()
  }, [error])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password_confirmation) {
      setError('Konfirmasi password tidak cocok')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const user = await register(form.name, form.email, form.password, form.password_confirmation)
      toast.success(`Akun dibuat. Selamat datang, ${user.name?.split(' ')[0] || 'Player'}!`)
      navigate('/')
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        setError(Object.values(errors)[0]?.[0] || 'Validasi gagal')
      } else {
        setError(err.response?.data?.message || 'Register gagal')
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
          <h1 className="fw-bolder mb-1" style={{ fontSize: '1.7rem' }}>Create your account.</h1>
          <p className="text-muted mb-4">Mulai booking lapangan favoritmu.</p>

          {error && (
            <div ref={errorRef} tabIndex={-1} role="alert" aria-labelledby="register-error-title" className="alert alert-danger">
              <strong id="register-error-title" className="d-block mb-1">Pendaftaran gagal</strong>
              {error}
            </div>
          )}

          <form onSubmit={submit} noValidate={false}>
            <div className="mb-3">
              <label className="form-label" htmlFor="reg-name">Nama</label>
              <input
                id="reg-name"
                type="text"
                name="name"
                className="form-control"
                placeholder="Nama lengkap"
                value={form.name}
                onChange={onChange}
                required
                autoComplete="name"
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                name="email"
                className="form-control"
                placeholder="nama@email.com"
                value={form.email}
                onChange={onChange}
                required
                autoComplete="email"
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                name="password"
                className="form-control"
                placeholder="Minimal 8 karakter"
                value={form.password}
                onChange={onChange}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className="mb-4">
              <label className="form-label" htmlFor="reg-password-confirm">Konfirmasi Password</label>
              <input
                id="reg-password-confirm"
                type="password"
                name="password_confirmation"
                className="form-control"
                placeholder="Ulangi password"
                value={form.password_confirmation}
                onChange={onChange}
                required
                minLength={8}
                autoComplete="new-password"
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
                  CREATE ACCOUNT
                  <Icon name="arrowRight" size={17} />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-4 mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
            Sudah punya akun?{' '}
            <Link to="/login" className="fw-bold">Login</Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}