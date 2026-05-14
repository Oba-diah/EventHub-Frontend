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
    router.push('/dashboard')
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
    const data = await login({
      email: form.value.email,
      password: form.value.password
    })

    // ✅ OTP FLOW SUCCESS (your backend behavior)
    if (data?.status === 'otp_sent') {
      localStorage.setItem('otpEmail', form.value.email)

      if (form.value.rememberMe) {
        localStorage.setItem('rememberedEmail', form.value.email)
      } else {
        localStorage.removeItem('rememberedEmail')
      }

      router.push('/otp')
      return
    }

    // ❌ Unexpected response
    loginError.value = data?.message || 'Unexpected login response'

  } catch (err) {
    loginError.value =
      err.response?.data?.message ||
      error.value ||
      'Login failed'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div style="min-height:100vh;display:flex;justify-content:center;align-items:center;background:linear-gradient(135deg,#667eea,#764ba2);padding:1rem;">

    <div style="background:white;padding:2.5rem;border-radius:12px;width:100%;max-width:420px;box-shadow:0 10px 30px rgba(0,0,0,0.15);">

      <h2 style="margin-bottom:1rem;">Login</h2>

      <!-- ERROR -->
      <div v-if="loginError || error" style="color:#dc2626;font-size:.9rem;margin-bottom:1rem;">
        {{ loginError || error }}
      </div>

      <!-- EMAIL -->
      <input
        v-model="form.email"
        placeholder="Email"
        style="width:100%;padding:.75rem;border:1px solid #ddd;border-radius:6px;margin-bottom:.5rem;"
      />
      <span v-if="errors.email" style="color:#dc2626;font-size:.85rem;">
        {{ errors.email }}
      </span>

      <!-- PASSWORD -->
      <input
        v-model="form.password"
        type="password"
        placeholder="Password"
        style="width:100%;padding:.75rem;border:1px solid #ddd;border-radius:6px;margin-top:.5rem;"
      />
      <span v-if="errors.password" style="color:#dc2626;font-size:.85rem;">
        {{ errors.password }}
      </span>

      <!-- REMEMBER ME -->
      <label style="display:flex;align-items:center;gap:6px;margin-top:10px;">
        <input type="checkbox" v-model="form.rememberMe" />
        Remember me
      </label>

      <!-- BUTTON -->
      <button
        @click="submit"
        :disabled="isSubmitting"
        style="width:100%;padding:.75rem;margin-top:1rem;border:none;border-radius:6px;cursor:pointer;font-weight:bold;"
        :style="{
          background: isSubmitting ? '#a5b4fc' : '#667eea',
          color: 'white',
          cursor: isSubmitting ? 'not-allowed' : 'pointer'
        }"
      >
        {{ isSubmitting ? 'Signing in...' : 'Login' }}
      </button>

      <!-- LINKS -->
      <div style="margin-top:1rem;display:flex;justify-content:space-between;font-size:.9rem;">
        <router-link to="/signup">Create account</router-link>
        <router-link to="/forgot-password">Forgot password?</router-link>
      </div>

    </div>
  </div>
</template>