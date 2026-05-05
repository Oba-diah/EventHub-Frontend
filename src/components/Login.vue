<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/services/auth'

const router = useRouter()
const { login, loading, error } = useAuth()

const form = ref({ email: '', password: '', rememberMe: false })
const errors = ref({})
const showPassword = ref(false)
const loginError = ref(null)
const isSubmitting = ref(false)

const isFormValid = computed(() => form.value.email && form.value.password && !isSubmitting.value)

onMounted(() => {
  if (localStorage.getItem('authToken')) return router.push('/')
  const saved = localStorage.getItem('rememberedEmail')
  if (saved) { form.value.email = saved; form.value.rememberMe = true }
})

const validate = () => {
  errors.value = {}
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.value.email.trim()) errors.value.email = 'Email is required'
  else if (!emailRegex.test(form.value.email)) errors.value.email = 'Please enter a valid email address'
  if (!form.value.password) errors.value.password = 'Password is required'
  else if (form.value.password.length < 6) errors.value.password = 'Password must be at least 6 characters'
  return !Object.keys(errors.value).length
}

const submit = async () => {
  loginError.value = null
  if (!validate()) return
  isSubmitting.value = true
  try {
    await login({ email: form.value.email, password: form.value.password })
    localStorage.setItem('otpPassword', form.value.password)
    localStorage[form.value.rememberMe ? 'setItem' : 'removeItem']('rememberedEmail', form.value.email)
    router.push('/otp')
  } catch (err) {
    loginError.value = error.value || 'Login failed. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

// ── Styles ────────────────────────────────────────────────────────────────────
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
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' },
  link: { fontSize: '.85rem', color: '#667eea', textDecoration: 'none', fontWeight: 500 },
  input: {
    width: '100%',
    padding: '.75rem 1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'inherit',
  },
  inputInvalid: { borderColor: '#dc2626' },
  inputDisabled: { background: '#f3f4f6', cursor: 'not-allowed' },
  error: { fontSize: '.875rem', color: '#dc2626', marginTop: '.25rem', display: 'block' },
  passwordWrap: { position: 'relative' },
  passwordInput: { paddingRight: '3rem' },
  toggle: {
    position: 'absolute', right: '.75rem', top: '50%', transform: 'translateY(-50%)',
    border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: '.25rem',
  },
  checkbox: { display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.9rem', color: '#4b5563', cursor: 'pointer', marginBottom: '1rem' },
  btn: {
    width: '100%', padding: '.875rem 1rem', borderRadius: '6px', fontSize: '1rem',
    fontWeight: 600, cursor: 'pointer', textDecoration: 'none', border: '2px solid transparent',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '.75rem',
  },
  primary: { background: '#667eea', color: 'white', borderColor: '#667eea' },
  primaryDisabled: { background: '#cbd5e1', borderColor: '#cbd5e1', cursor: 'not-allowed' },
  secondary: { background: '#f3f4f6', color: '#1f2937', borderColor: '#e5e7eb' },
  outline: { background: 'transparent', color: '#667eea', borderColor: '#667eea' },
  spinner: {
    display: 'inline-block', width: '.85rem', height: '.85rem', marginRight: '.5rem',
    border: '2px solid currentColor', borderRightColor: 'transparent',
    borderRadius: '50%', animation: 'spin .6s linear infinite',
  },
  dividerWrap: { textAlign: 'center', fontSize: '.85rem', color: '#9ca3af', position: 'relative', margin: '1.5rem 0' },
  dividerLine: { position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: '#e5e7eb', transform: 'translateY(-50%)' },
  dividerText: { background: 'white', padding: '0 .5rem', position: 'relative' },
}

// Merges style objects — keeps conditional styles clean in template
const mx = (...objs) => Object.assign({}, ...objs)
</script>

<template>
  <div :style="s.wrapper">
    <div :style="s.card">

      <div :style="s.header">
        <h1 :style="s.h1">Welcome Back</h1>
        <p :style="s.subtitle">Sign in to your account</p>
      </div>

      <div v-if="loginError || error" :style="s.alert" role="alert">
        <strong>Login Failed</strong> — {{ loginError || error }}
      </div>

      <div :style="s.form" @keydown.enter="submit">

        <!-- Email -->
        <div :style="s.field">
          <label :style="s.label" for="email">Email Address</label>
          <input
            id="email" v-model="form.email" type="email"
            :style="mx(s.input, errors.email && s.inputInvalid, isSubmitting && s.inputDisabled)"
            placeholder="Enter your email" autocomplete="email" :disabled="isSubmitting"
          />
          <span v-if="errors.email" :style="s.error">{{ errors.email }}</span>
        </div>

        <!-- Password -->
        <div :style="s.field">
          <div :style="s.row">
            <label :style="s.label" for="password">Password</label>
            <router-link to="/forgot-password" :style="s.link">Forgot password?</router-link>
          </div>
          <div :style="s.passwordWrap">
            <input
              id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'"
              :style="mx(s.input, s.passwordInput, errors.password && s.inputInvalid, isSubmitting && s.inputDisabled)"
              placeholder="Enter your password" autocomplete="current-password" :disabled="isSubmitting"
            />
            <button type="button" :style="s.toggle" @click="showPassword = !showPassword" :disabled="isSubmitting">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          <span v-if="errors.password" :style="s.error">{{ errors.password }}</span>
        </div>

        <!-- Remember me -->
        <label :style="s.checkbox">
          <input v-model="form.rememberMe" type="checkbox" :disabled="isSubmitting" />
          Remember me on this device
        </label>

        <!-- Submit -->
        <button
          type="button"
          :style="mx(s.btn, !isFormValid || loading ? s.primaryDisabled : s.primary)"
          :disabled="!isFormValid || loading"
          @click="submit"
        >
          <template v-if="isSubmitting || loading">
            <span :style="s.spinner" /> Signing in...
          </template>
          <template v-else>Sign In</template>
        </button>
      </div>

      <!-- Divider -->
      <div :style="s.dividerWrap">
        <div :style="s.dividerLine" />
        <span :style="s.dividerText">New to EventHub?</span>
      </div>

      <router-link to="/signup" :style="mx(s.btn, s.secondary)">Create Account</router-link>
      <router-link to="/" :style="mx(s.btn, s.outline)">Return to Home</router-link>

    </div>
  </div>
</template>