<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const errors = ref({})
const success = ref(false)
const isSubmitting = ref(false)

const validate = () => {
  errors.value = {}
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.value.trim()) {
    errors.value.email = 'Email is required'
  } else if (!emailRegex.test(email.value)) {
    errors.value.email = 'Please enter a valid email address'
  }
  return !Object.keys(errors.value).length
}

const submit = async () => {
  if (!validate()) return
  isSubmitting.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 700))
    success.value = true
  } finally {
    isSubmitting.value = false
  }
}

const s = {
  wrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  card: {
    background: 'white',
    borderRadius: '14px',
    padding: '2rem',
    boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
    width: '100%',
    maxWidth: '440px',
  },
  header: { textAlign: 'center', marginBottom: '1.75rem' },
  h1: { fontSize: '2rem', margin: '0 0 .5rem', color: '#111827' },
  subtitle: { margin: 0, color: '#6b7280', lineHeight: 1.6 },
  alert: {
    padding: '1rem 1.1rem',
    borderRadius: '10px',
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    color: '#065f46',
    marginBottom: '1.5rem',
  },
  form: { marginBottom: '1.5rem' },
  field: { marginBottom: '1.25rem' },
  label: { display: 'block', marginBottom: '.5rem', color: '#374151', fontWeight: 600 },
  input: {
    width: '100%',
    padding: '.9rem 1rem',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  error: { color: '#b91c1c', fontSize: '.9rem', marginTop: '.5rem' },
  btn: {
    width: '100%',
    padding: '.95rem 1rem',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
  },
  primary: { background: '#7c3aed', color: 'white' },
  primaryDisabled: { background: '#c7d2fe', color: '#6b7280', cursor: 'not-allowed' },
  linkRow: { textAlign: 'center', marginTop: '1.25rem' },
  link: { color: '#4f46e5', textDecoration: 'none', fontWeight: 600, cursor: 'pointer' },
  note: { color: '#4b5563', fontSize: '.95rem', marginTop: '.75rem', textAlign: 'center' },
}

const mx = (...objs) => Object.assign({}, ...objs)
</script>

<template>
  <div :style="s.wrapper">
    <div :style="s.card">
      <div :style="s.header">
        <h1 :style="s.h1">Forgot Password</h1>
        <p :style="s.subtitle">Enter the email address associated with your account and we’ll send reset instructions.</p>
      </div>

      <div v-if="success" :style="s.alert" role="status">
        <strong>Check your inbox.</strong> If an account exists for that email, reset instructions have been sent.
      </div>

      <div :style="s.form">
        <div :style="s.field">
          <label :style="s.label" for="forgot-email">Email Address</label>
          <input
            id="forgot-email"
            type="email"
            v-model="email"
            :style="s.input"
            placeholder="you@example.com"
            autocomplete="email"
            :disabled="isSubmitting"
          />
          <span v-if="errors.email" :style="s.error">{{ errors.email }}</span>
        </div>

        <button
          type="button"
          :style="mx(s.btn, isSubmitting ? s.primaryDisabled : s.primary)"
          :disabled="isSubmitting"
          @click="submit"
        >
          {{ isSubmitting ? 'Sending...' : 'Send Reset Link' }}
        </button>
      </div>

      <div :style="s.linkRow">
        <a href="#" @click.prevent="router.push('/login')" :style="s.link">Back to Login</a>
      </div>
      <p :style="s.note">If you don’t receive an email, check your spam folder or try again in a minute.</p>
    </div>
  </div>
</template>
