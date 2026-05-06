import { ref, computed } from 'vue'
import api  from './api';

const user = ref(null)
const loading = ref(false)
const error = ref(null)

export function useAuth() {
    const isAuthenticated = computed(() => !!user.value)
    const isAdmin = ref(false)


    // Login
    async function login(credentials) {
        loading.value = true
        error.value = null

        try {

        if (!credentials.email || !credentials.password) {
            throw new Error('Email and password are required')
        }

        const response = await api.post('login', credentials) //important line,connects backend and frontend

        console.log(response.data)

        if (response.data.message === 'OTP sent to your email.') {
            localStorage.setItem('otpEmail', credentials.email)
            return response
        } else {
            throw new Error('Invalid response format from server')
        }

        } catch (err) {
            error.value = err.response?.data?.message || err.message || 'Login failed'
            throw err
        } finally {
            loading.value = false
        }
    }

    // Register
    async function register(formData) {
        loading.value = true
        error.value = null
        try {
             const response = await api.post('register', formData)
             const { token, user: userData } = response.data
            if (token && userData) {
                user.value = userData
                localStorage.setItem("authToken", token);
                localStorage.setItem("user", JSON.stringify(user));

                return response
            } else {
                throw new Error('Invalid response format from server')
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Registration failed'
            throw err
        } finally {
            loading.value = false
        }
    }

    // Verify OTP
    async function verifyOtp(credentials) {
        loading.value = true
        error.value = null

        try {

        if (!credentials.email || !credentials.otp) {
            throw new Error('Email and OTP are required')
        }

        const response = await api.post('verify-otp', credentials)
        const { token, user: userData } = response.data

        console.log(response.data)

        if (token && userData) {
            user.value = userData

            if (user.value.role_id == 1) isAdmin.value = true

            console.log(user.value)

            localStorage.setItem("authToken", token);
            localStorage.setItem("user", JSON.stringify(user.value));
            localStorage.setItem("isAdmin", isAdmin.value);

            return response
        } else {
            throw new Error('Invalid response format from server')
        }

        } catch (err) {
            error.value = err.response?.data?.message || err.message || 'OTP verification failed'
            throw err
        } finally {
            loading.value = false
        }
    }

    function logout() {
        user.value = null
        isAdmin.value = false
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        localStorage.removeItem('otpEmail')
        localStorage.removeItem('isAdmin')
    }

    return {
        user,
        loading,
        error,
        isAuthenticated,
        isAdmin,
        login,
        verifyOtp,
        register,
        logout,
    }
 }