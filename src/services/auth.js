import { ref, computed } from 'vue'
import api from './api'

const user = ref(JSON.parse(localStorage.getItem('user')) || null)
const loading = ref(false)
const error = ref(null)

export function useAuth() {
    const isAuthenticated = computed(() => !!localStorage.getItem('token'))
    const isAdmin = computed(() => user.value?.role_id === 1)

    async function login(credentials) {
        loading.value = true
        error.value = null

        try {
            if (!credentials.email || !credentials.password) {
                throw new Error('Email and password required')
            }

            const response = await api.post('login', credentials)

            if (response.data.message === 'OTP sent to your email.') {
                localStorage.setItem('otpEmail', credentials.email)
                localStorage.setItem('otpPassword', credentials.password)
                return response
            }

            throw new Error('Unexpected server response')
        } catch (err) {
            error.value = err.response?.data?.message || err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    async function register(formData) {
        loading.value = true
        error.value = null

        try {
            const response = await api.post('register', formData)
            return response
        } catch (err) {
            error.value = err.response?.data?.message || 'Registration failed'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function verifyOtp(credentials) {
        loading.value = true
        error.value = null

        try {
            const response = await api.post('verify-otp', credentials)
            const { token, user: userData } = response.data

            if (!token || !userData) {
                throw new Error('Invalid server response')
            }

            user.value = userData

            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(userData))
            localStorage.setItem('isAdmin', userData?.role_id === 1 ? 'true' : 'false')

            return response
        } catch (err) {
            error.value = err.response?.data?.message || err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    function logout() {
        user.value = null
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('otpEmail')
        localStorage.removeItem('otpPassword')
        localStorage.removeItem('isAdmin')
    }

    return {
        user,
        loading,
        error,
        isAuthenticated,
        isAdmin,
        login,
        register,
        verifyOtp,
        logout
    }
}