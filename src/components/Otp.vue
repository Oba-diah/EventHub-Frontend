<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/services/auth'

const router = useRouter()
const { verifyOtp, login, error, loading } = useAuth()

const email = ref(localStorage.getItem('otpEmail') || '')
const otpDigits = ref(['', '', '', '', '', ''])
const otpInputs = ref([])
const otpError = ref(null)
const isSubmitting = ref(false)

const isValid = computed(() =>
  otpDigits.value.every(d => d !== '') && !isSubmitting.value
)

onMounted(() => {
  if (!email.value) {
    router.push('/login')
  }
})

const submit = async () => {
  otpError.value = null

  const otp = otpDigits.value.join('')

  if (otp.length !== 6) {
    otpError.value = 'Enter 6-digit OTP'
    return
  }

  isSubmitting.value = true

  try {
    const res = await verifyOtp({
      email: email.value,
      otp: otp
    })

    const data = res?.data

    if (!data?.token) {
      throw new Error(data?.message || 'Invalid server response')
    }

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    localStorage.removeItem('otpEmail')
    localStorage.removeItem('otpPassword')

    // 
    if (Number(data.user.role_id) === 1) {
     router.push('/admin')
    } else {
      router.push('/')
    }
  } catch (err) {
    otpError.value =
      err.response?.data?.message ||
      err.message ||
      'OTP verification failed'
  } finally {
    isSubmitting.value = false
  }
}

const handleInput = (e, i) => {
  const val = e.target.value.replace(/\D/g, '')

  if (val) {
    otpDigits.value[i] = val.slice(-1)
    if (i < 5) otpInputs.value[i + 1]?.focus()
  } else {
    otpDigits.value[i] = ''
  }
}

const handleKeydown = (e, i) => {
  if (e.key === 'Backspace' && !otpDigits.value[i] && i > 0) {
    otpInputs.value[i - 1]?.focus()
  }
}

const handlePaste = (e) => {
  e.preventDefault()

  const paste = e.clipboardData
    .getData('text')
    .replace(/\D/g, '')
    .slice(0, 6)

  paste.split('').forEach((d, i) => {
    otpDigits.value[i] = d
  })

  otpInputs.value[Math.min(5, paste.length - 1)]?.focus()
}

const resendOtp = async () => {
  try {
    await login({
      email: email.value,
      password: localStorage.getItem('otpPassword')
    })
  } catch (err) {
    otpError.value =
      err.response?.data?.message || 'Failed to resend OTP'
  }
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg,#667eea,#764ba2)',
    padding: '20px'
  },
  card: {
    background: '#fff',
    width: '100%',
    maxWidth: '420px',
    padding: '30px',
    borderRadius: '14px',
    boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
    textAlign: 'center'
  },
  title: { fontSize: '24px', marginBottom: '6px' },
  subtitle: { fontSize: '14px', color: '#666' },
  email: { fontWeight: 'bold', marginBottom: '20px' },
  alert: {
    background: '#ffe5e5',
    color: '#b00020',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '15px',
    fontSize: '14px'
  },
  otpBox: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '20px'
  },
  input: {
    width: '45px',
    height: '50px',
    fontSize: '20px',
    textAlign: 'center',
    border: '2px solid #ddd',
    borderRadius: '8px',
    outline: 'none'
  },
  btn: {
    width: '100%',
    padding: '12px',
    background: '#667eea',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '12px'
  },
  btnDisabled: {
    background: '#bbb',
    cursor: 'not-allowed'
  },
  resend: {
    fontSize: '14px',
    color: '#666',
    marginTop: '10px'
  },
  resendLink: {
    color: '#667eea',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  back: {
    display: 'block',
    marginTop: '15px',
    color: '#333',
    textDecoration: 'none'
  }
}

const mx = (...o) => Object.assign({}, ...o)
</script>

<template>
  <div :style="styles.wrapper">
    <div :style="styles.card">

      <h1 :style="styles.title">Verify OTP</h1>
      <p :style="styles.subtitle">Code sent to</p>
      <p :style="styles.email">{{ email }}</p>

      <div v-if="otpError || error" :style="styles.alert">
        {{ otpError || error }}
      </div>

      <div :style="styles.otpBox">
        <input
          v-for="(d, i) in otpDigits"
          :key="i"
          :ref="el => otpInputs[i] = el"
          maxlength="1"
          inputmode="numeric"
          :style="styles.input"
          :value="d"
          @input="handleInput($event, i)"
          @keydown="handleKeydown($event, i)"
          @paste="handlePaste"
        />
      </div>

      <button
        :style="mx(styles.btn, !isValid || isSubmitting || loading ? styles.btnDisabled : {})"
        :disabled="!isValid || isSubmitting || loading"
        @click="submit"
      >
        {{ isSubmitting ? 'Verifying...' : 'Verify OTP' }}
      </button>

      <div :style="styles.resend">
        Didn’t receive code?
        <span :style="styles.resendLink" @click="resendOtp">
          Resend OTP
        </span>
      </div>

      <router-link to="/login" :style="styles.back">
        Back to Login
      </router-link>

    </div>
  </div>
</template>