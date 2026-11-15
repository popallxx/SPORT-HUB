/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

function readStoredUser() {
  try {
    const stored = localStorage.getItem('sporthub_user')
    if (!stored) return null

    const parsed = JSON.parse(stored)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Format data user tidak valid')
    }

    return parsed
  } catch {
    try {
      localStorage.removeItem('sporthub_user')
    } catch {
      // localStorage bisa diblokir; abaikan agar aplikasi tetap bisa render.
    }
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)
  const [loading, setLoading] = useState(() => !!localStorage.getItem('sporthub_token'))

  useEffect(() => {
    if (!localStorage.getItem('sporthub_token')) return

    api
      .get('/user')
      .then((res) => {
        setUser(res.data.data)
        localStorage.setItem('sporthub_user', JSON.stringify(res.data.data))
      })
      .catch(() => {
        localStorage.removeItem('sporthub_token')
        localStorage.removeItem('sporthub_user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/login', { email, password })
    localStorage.setItem('sporthub_token', res.data.data.token)
    localStorage.setItem('sporthub_user', JSON.stringify(res.data.data.user))
    setUser(res.data.data.user)
    return res.data.data.user
  }

  const register = async (name, email, password, passwordConfirmation) => {
    const res = await api.post('/register', {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    })
    localStorage.setItem('sporthub_token', res.data.data.token)
    localStorage.setItem('sporthub_user', JSON.stringify(res.data.data.user))
    setUser(res.data.data.user)
    return res.data.data.user
  }

  const logout = async () => {
    try {
      await api.post('/logout')
    } catch {
      // token mungkin sudah tidak valid, abaikan
    }
    localStorage.removeItem('sporthub_token')
    localStorage.removeItem('sporthub_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
