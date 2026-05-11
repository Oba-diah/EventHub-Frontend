<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/services/auth'

const router = useRouter()
const { verifyOtp, login, loading, error } = useAuth()

const email = ref(localStorage.getItem('otpEmail') || '')
const otp = ref('')
const errors = ref({})
const otpError = ref(null)
const isSubmitting = ref(false)

const isFormValid = computed(() => otp.value.length === 6 && !isSubmitting.value)

onMounted(() => {
  if (!email.value) {
    router.push('/login')
  }
  if (localStorage.getItem('token')) {
    router.push('/')
  }
})

const validate = () => {
  errors.value = {}
  if (!otp.value) errors.value.otp = 'OTP is required'
  else if (otp.value.length !== 6 || !/^\d{6}$/.test(otp.value)) errors.value.otp = 'OTP must be 6 digits'
  return !Object.keys(errors.value).length
}

const submit = async () => {
  otpError.value = null
  if (!validate()) return
  isSubmitting.value = true
  try {
    await verifyOtp({ email: email.value, otp: otp.value })
    localStorage.removeItem('otpEmail')
    localStorage.removeItem('otpPassword')
    router.push(localStorage.getItem('isAdmin') === 'true' ? '/admin' : '/')
  } catch (err) {
    otpError.value = error.value || 'OTP verification failed. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

const resendOtp = async () => {
  try {
    const savedPassword = localStorage.getItem('otpPassword')
    if (!savedPassword) {
      otpError.value = 'Unable to resend OTP. Please login again.'
      return
    }

    await login({ email: email.value, password: savedPassword })
  } catch (err) {
    otpError.value = err.response?.data?.message || err.message || 'Failed to resend OTP.'
  }
}
const s = {
  wrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '2.5rem',
    boxShadow: '0 10px 40px rgba(0,0,0,.2)',
    width: '100%',
    maxWidth: '420px',
  },
  header: { textAlign: 'center', marginBottom: '2rem' },
  h1: { fontSize: '2rem', fontWeight: 700, color: '#1f2937', margin: '0 0 .5rem' },
  subtitle: { color: '#6b7280', margin: 0 },
  alert: {
    padding: '.875rem 1rem',
    background: '#fee2e2',
    border: '1px solid #fecaca',
    color: '#991b1b',
    borderRadius: '8px',
    fontSize: '.9rem',
    marginBottom: '1.5rem',
  },
  form: { marginBottom: '1.5rem' },
  field: { marginBottom: '1.25rem' },
  label: { display: 'block', fontWeight: 500, color: '#1f2937', fontSize: '.95rem', marginBottom: '.5rem' },
  input: {
    width: '100%',
    padding: '.75rem 1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'inherit',
    textAlign: 'center',
    fontSize: '1.5rem',
    letterSpacing: '0.5rem',
  },
  inputInvalid: { borderColor: '#dc2626' },
  inputDisabled: { background: '#f3f4f6', cursor: 'not-allowed' },
  error: { fontSize: '.875rem', color: '#dc2626', marginTop: '.25rem', display: 'block' },
  btn: {
    width: '100%',
    padding: '.875rem 1rem',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
    border: '2px solid transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '.75rem',
  },
  primary: { background: '#667eea', color: 'white', borderColor: '#667eea' },
  primaryDisabled: { background: '#cbd5e1', borderColor: '#cbd5e1', cursor: 'not-allowed' },
  secondary: { background: '#f3f4f6', color: '#1f2937', borderColor: '#e5e7eb' },
  spinner: {
    display: 'inline-block',
    width: '.85rem',
    height: '.85rem',
    marginRight: '.5rem',
    border: '2px solid currentColor',
    borderRightColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin .6s linear infinite',
  },
  resend: {
    textAlign: 'center',
    fontSize: '.9rem',
    color: '#6b7280',
    marginTop: '1rem',
  },
  resendLink: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: 500,
    cursor: 'pointer',
  },
}

// Merges style objects — keeps conditional styles clean in template
const mx = (...objs) => Object.assign({}, ...objs)
</script>

<template>
  <div :style="s.wrapper">
    <div :style="s.card">

      <div :style="s.header">
        <h1 :style="s.h1">Verify Your Email</h1>
        <p :style="s.subtitle">Enter the 6-digit OTP sent to {{ email }}</p>
      </div>

      <div v-if="otpError || error" :style="s.alert" role="alert">
        <strong>Verification Failed</strong> — {{ otpError || error }}
      </div>

      <div :style="s.form" @keydown.enter="submit">

        <!-- OTP -->
        <div :style="s.field">
          <label :style="s.label" for="otp">OTP Code</label>
          <input
            id="otp"
            v-model="otp"
            type="text"
            :style="mx(s.input, errors.otp && s.inputInvalid, isSubmitting && s.inputDisabled)"
            placeholder="000000"
            maxlength="6"
            :disabled="isSubmitting"
            @input="otp = otp.replace(/\D/g, '')"
          />
          <span v-if="errors.otp" :style="s.error">{{ errors.otp }}</span>
        </div>

        <!-- Submit -->
        <button
          type="button"
          :style="mx(s.btn, !isFormValid || loading ? s.primaryDisabled : s.primary)"
          :disabled="!isFormValid || loading"
          @click="submit"
        >
          <template v-if="isSubmitting || loading">
            <span :style="s.spinner" /> Verifying...
          </template>
          <template v-else>Verify OTP</template>
        </button>
      </div>

      <div :style="s.resend">
        Didn't receive the OTP?
        <span :style="s.resendLink" @click="resendOtp">Resend OTP</span>
      </div>

      <router-link to="/login" :style="mx(s.btn, s.secondary)">Back to Login</router-link>

    </div>
  </div>
</template>