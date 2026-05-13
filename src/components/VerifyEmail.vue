<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const message = ref('')
const error = ref('')

const verifyEmail = async () => {
  loading.value = true
  error.value = ''
  message.value = ''

  try {
    // ✅ Get ID from route params
    const id = route.params.id

    // ✅ Send ALL signed URL params automatically
    const res = await api.get(`/verify-email/${id}`, {
      params: route.query
    })

    message.value = res.data.message

    // ✅ AUTO LOGIN
    if (res.data.token) {
  localStorage.setItem('token', res.data.token)

  api.defaults.headers.common.Authorization =
    `Bearer ${res.data.token}`
  }

    // ✅ Redirect after success
    setTimeout(() => {
      router.push('/')
    }, 2000)

  } catch (err) {
    error.value =
      err.response?.data?.message || 'Verification failed'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  verifyEmail()
})
</script>

<template>
  <div class="verify-container">

    <h2>Email Verification</h2>

    <p v-if="loading">
      Verifying your email...
    </p>

    <p
      v-if="message"
      class="success"
    >
      {{ message }}
    </p>

    <p
      v-if="error"
      class="error"
    >
      {{ error }}
    </p>

    <button
      v-if="error"
      @click="verifyEmail"
    >
      Try Again
    </button>

  </div>
</template>

<style scoped>
.verify-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  text-align: center;
  font-family: Inter, sans-serif;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
}

.success {
  color: #86efac;
  font-weight: 600;
}

.error {
  color: #fca5a5;
  font-weight: 600;
}

button {
  border: none;
  padding: 12px 22px;
  border-radius: 10px;
  background: white;
  color: #4f46e5;
  font-weight: 700;
  cursor: pointer;
}
</style>