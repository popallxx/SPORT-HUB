import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sporthub_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const authPages = ['/login', '/register']
      if (!authPages.includes(window.location.pathname)) {
        localStorage.removeItem('sporthub_token')
        localStorage.removeItem('sporthub_user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api
