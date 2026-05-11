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
const showPassword = ref(false)
const loginError = ref(null)
const isSubmitting = ref(false)

const isFormValid = computed(() =>
  form.value.email &&
  form.value.password &&
  !isSubmitting.value
)

onMounted(() => {
  const token = localStorage.getItem('token')

  if (token) router.push('/')

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
    await login({
      email: form.value.email,
      password: form.value.password
    })

    if (form.value.rememberMe) {
      localStorage.setItem('rememberedEmail', form.value.email)
    } else {
      localStorage.removeItem('rememberedEmail')
    }

    router.push('/otp')
  } catch (err) {
    loginError.value = error.value || 'Login failed'
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
    maxWidth: '420px'
  },
  input: {
    width: '100%',
    padding: '.75rem',
    border: '1px solid #ddd',
    borderRadius: '6px'
  },
  btn: {
    width: '100%',
    padding: '.75rem',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    background: '#667eea',
    color: 'white'
  },
  error: {
    color: 'red',
    fontSize: '.85rem'
  }
}

const mx = (...objs) => Object.assign({}, ...objs)
</script>

<template>
  <div :style="s.wrapper">
    <div :style="s.card">

      <h2>Login</h2>

      <div v-if="loginError || error" :style="s.error">
        {{ loginError || error }}
      </div>

      <input v-model="form.email" placeholder="Email" :style="s.input" />
      <span v-if="errors.email" :style="s.error">{{ errors.email }}</span>

      <input
        v-model="form.password"
        :type="showPassword ? 'text' : 'password'"
        placeholder="Password"
        :style="s.input"
      />
      <span v-if="errors.password" :style="s.error">{{ errors.password }}</span>

      <label>
        <input type="checkbox" v-model="form.rememberMe" />
        Remember me
      </label>

      <button :style="s.btn" @click="submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Signing in...' : 'Login' }}
      </button>

      <router-link to="/signup">Create account</router-link>
      <router-link to="/forgot-password" style="margin-left: 1rem;">Forgot password?</router-link>
    </div>
  </div>
</template>