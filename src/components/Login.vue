<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/services/auth'

const router = useRouter()
const { login, error } = useAuth()

const form = ref({
  email: '',
  password: '',
  rememberMe: false
})

const errors = ref({})
const loginError = ref(null)
const isSubmitting = ref(false)

const isFormValid = computed(() =>
  form.value.email &&
  form.value.password &&
  !isSubmitting.value
)

onMounted(() => {
  if (localStorage.getItem('token')) {
    router.push('/')
  }

  const saved = localStorage.getItem('rememberedEmail')
  if (saved) {
    form.value.email = saved
    form.value.rememberMe = true
  }
})

const validate = () => {
  errors.value = {}

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!form.value.email.trim()) {
    errors.value.email = 'Email is required'
  } else if (!emailRegex.test(form.value.email)) {
    errors.value.email = 'Invalid email'
  }

  if (!form.value.password) {
    errors.value.password = 'Password is required'
  } else if (form.value.password.length < 8) {
    errors.value.password = 'Password must be at least 8 characters'
  }

  return Object.keys(errors.value).length === 0
}

const submit = async () => {
  loginError.value = null

  if (!validate()) return

  isSubmitting.value = true

  try {
    const res = await login({
      email: form.value.email,
      password: form.value.password
    })

    const data = res?.data

    if (
      data?.status === 'otp_sent' ||
      data?.message === 'OTP sent to your email.'
    ) {
      localStorage.setItem('otpEmail', form.value.email)
      localStorage.setItem('otpPassword', form.value.password)

      if (form.value.rememberMe) {
        localStorage.setItem('rememberedEmail', form.value.email)
      } else {
        localStorage.removeItem('rememberedEmail')
      }

      router.push('/otp')
      return
    }

    loginError.value = data?.message || 'Login failed'

  } catch (err) {
    loginError.value =
      err.response?.data?.message ||
      error.value ||
      'Login failed'
  } finally {
    isSubmitting.value = false
  }
}

const s = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg,#667eea,#764ba2)',
    padding: '1rem'
  },

  card: {
    background: 'white',
    padding: '2.5rem',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
  },

  input: {
    width: '100%',
    padding: '.75rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    marginBottom: '.5rem'
  },

  btn: {
    width: '100%',
    padding: '.75rem',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    background: '#667eea',
    color: 'white',
    marginTop: '1rem',
    fontWeight: 'bold'
  },

  btnDisabled: {
    background: '#a5b4fc',
    cursor: 'not-allowed'
  },

  error: {
    color: '#dc2626',
    fontSize: '.85rem',
    marginBottom: '.5rem'
  },

  links: {
    marginTop: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '.9rem'
  }
}
</script>

<template>
  <div :style="s.wrapper">
    <div :style="s.card">

      <h2 style="margin-bottom: 1rem;">Login</h2>

      <div v-if="loginError || error" :style="s.error">
        {{ loginError || error }}
      </div>

      <input
        v-model="form.email"
        placeholder="Email"
        :style="s.input"
      />
      <span v-if="errors.email" :style="s.error">
        {{ errors.email }}
      </span>

      <input
        v-model="form.password"
        type="password"
        placeholder="Password"
        :style="s.input"
      />
      <span v-if="errors.password" :style="s.error">
        {{ errors.password }}
      </span>

      <label style="display:flex; align-items:center; gap:6px; margin-top:8px;">
        <input type="checkbox" v-model="form.rememberMe" />
        Remember me
      </label>

      <button
        :style="isSubmitting ? {...s.btn, ...s.btnDisabled} : s.btn"
        @click="submit"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? 'Signing in...' : 'Login' }}
      </button>

      <div :style="s.links">
        <router-link to="/signup">Create account</router-link>
        <router-link to="/forgot-password">Forgot password?</router-link>
      </div>

    </div>
  </div>
</template>