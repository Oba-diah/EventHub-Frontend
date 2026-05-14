import { ref } from 'vue'
import api from './api'

const loading = ref(false)
const error = ref(null)

function setAuthHeader(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

const savedToken = localStorage.getItem('token')
if (savedToken) {
  setAuthHeader(savedToken)
}

export function useAuth() {

  const login = async (credentials) => {
    loading.value = true
    error.value = null

    try {
      const res = await api.post('/login', credentials)

      if (res.data.message === 'OTP sent to your email.') {
        localStorage.setItem('otpEmail', credentials.email)
        localStorage.setItem('otpPassword', credentials.password)
      }

      return res.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const verifyOtp = async (payload) => {
    loading.value = true
    error.value = null

    try {
      const res = await api.post('/verify-otp', payload)

      const token = res.data.token
      const user = res.data.user

      if (!token) {
        throw new Error('Token missing from response')
      }

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      setAuthHeader(token)

      return res
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const register = async (userData) => {
    loading.value = true
    error.value = null

    try {
      const res = await api.post('/register', userData)

      return res
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      await api.post('/logout')
    } catch {}

    localStorage.removeItem('token')
    localStorage.removeItem('user')

    setAuthHeader(null)
  }

  return {
    login,
    register,
    verifyOtp,
    logout,
    loading,
    error
  }
}