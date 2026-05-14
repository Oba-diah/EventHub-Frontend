<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/services/auth'

const router = useRouter()
const { register, loading, error } = useAuth()

const form = ref({
  name: '',
  email: '',
  password: '',
  passwordConfirm: '',
  phone: '',
  gender: '',
  dateOfBirth: '',
  location: '',
  agreeToTerms: false
})

const errors = ref({})
const showPassword = ref(false)
const showConfirm = ref(false)
const signupError = ref(null)
const isSubmitting = ref(false)

/* ✅ DOB FIX: prevent future dates */
const today = new Date().toISOString().split('T')[0]

const isFormValid = computed(() =>
  form.value.name &&
  form.value.email &&
  form.value.password &&
  form.value.passwordConfirm &&
  form.value.agreeToTerms &&
  !isSubmitting.value
)

const strengthMeta = computed(() => {
  const p = form.value.password
  if (!p) return null

  let score = 0
  if (p.length >= 6) score++
  if (p.length >= 10) score++
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^a-zA-Z0-9]/.test(p)) score++

  return [
    ['weak', '33%', '#dc2626'],
    ['fair', '66%', '#f59e0b'],
    ['good', '85%', '#84cc16'],
    ['strong', '100%', '#10b981'],
  ][score <= 2 ? 0 : score <= 3 ? 1 : score <= 4 ? 2 : 3]
})

onMounted(() => {
  if (localStorage.getItem('token')) {
    router.push('/dashboard')
  }
})

const REGEXES = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/
}

const validate = () => {
  errors.value = {}
  const {
    name,
    email,
    password,
    passwordConfirm,
    phone,
    dateOfBirth,
    agreeToTerms
  } = form.value

  if (!name.trim()) errors.value.name = 'Full name is required'
  else if (name.trim().length < 3) errors.value.name = 'Name must be at least 3 characters'

  if (!email.trim()) errors.value.email = 'Email is required'
  else if (!REGEXES.email.test(email)) errors.value.email = 'Enter a valid email'

  if (!password) errors.value.password = 'Password is required'
  else if (password.length < 8) errors.value.password = 'Minimum 8 characters'
  else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password))
    errors.value.password = 'Must contain letters and numbers'

  if (!passwordConfirm) errors.value.passwordConfirm = 'Confirm your password'
  else if (password !== passwordConfirm)
    errors.value.passwordConfirm = 'Passwords do not match'

  if (phone && !REGEXES.phone.test(phone.replace(/\s/g, '')))
    errors.value.phone = 'Invalid phone number'

  /* ✅ DOB VALIDATION (BEST PRACTICE) */
  if (dateOfBirth) {
    const selectedDate = new Date(dateOfBirth)
    const now = new Date()

    if (selectedDate > now) {
      errors.value.dateOfBirth = 'Date of birth cannot be in the future'
    }
  }

  if (!agreeToTerms)
    errors.value.agreeToTerms = 'You must agree to terms'

  return !Object.keys(errors.value).length
}

const submit = async () => {
  signupError.value = null
  if (!validate()) return

  isSubmitting.value = true

  try {
    const {
      name,
      email,
      password,
      phone,
      gender,
      dateOfBirth,
      location
    } = form.value

    await register({
      name,
      email,
      password,
      phoneNumber: phone || null,
      gender: gender || null,
      dateOfBirth: dateOfBirth || null,
      location: location || null,
      role_id: 2
    })

    router.push('/login')
  } catch {
    signupError.value = error.value || 'Registration failed. Please try again.'
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
    maxWidth: '440px',
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
  label: {
    display: 'block',
    fontWeight: 500,
    color: '#1f2937',
    fontSize: '.95rem',
    marginBottom: '.5rem'
  },
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
  error: { fontSize: '.875rem', color: '#dc2626', marginTop: '.25rem' },
  btn: {
    width: '100%',
    padding: '.875rem 1rem',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    border: '2px solid transparent',
  },
  primary: { background: '#667eea', color: 'white' },
  primaryDisabled: { background: '#cbd5e1', cursor: 'not-allowed' },
}

const mx = (...objs) => Object.assign({}, ...objs)

const inp = (field, extra) =>
  mx(s.input, extra, errors.value[field] && s.inputInvalid, isSubmitting.value && s.inputDisabled)
</script>
<template>
  <div :style="s.wrapper">
    <div :style="s.card">

      <div :style="s.header">
        <h1 :style="s.h1">Join EventHub</h1>
        <p :style="s.subtitle">Create an account to get started</p>
      </div>

      <div v-if="signupError || error" :style="s.alert" role="alert">
        <strong>Registration Failed</strong> — {{ signupError || error }}
      </div>

      <div :style="s.form" @keydown.enter="submit">

        <!-- Full Name -->
        <div :style="s.field">
          <label :style="s.label" for="name">Full Name</label>
          <input id="name" v-model="form.name" type="text" :style="inp('name')"
            placeholder="Enter your full name" autocomplete="name" :disabled="isSubmitting" />
          <span v-if="errors.name" :style="s.error">{{ errors.name }}</span>
        </div>

        <!-- Email -->
        <div :style="s.field">
          <label :style="s.label" for="email">Email Address</label>
          <input id="email" v-model="form.email" type="email" :style="inp('email')"
            placeholder="Enter your email" autocomplete="email" :disabled="isSubmitting" />
          <span v-if="errors.email" :style="s.error">{{ errors.email }}</span>
        </div>

        <!-- Phone (optional) -->
        <div :style="s.field">
          <label :style="s.label" for="phone">
            Phone Number <span :style="s.optional">(Optional)</span>
          </label>
          <input id="phone" v-model="form.phone" type="tel" :style="inp('phone')"
            placeholder="Enter your phone number" autocomplete="tel" :disabled="isSubmitting" />
          <span v-if="errors.phone" :style="s.error">{{ errors.phone }}</span>
        </div>

        <div :style="s.field">
          <label :style="s.label" for="gender">
            Gender <span :style="s.optional">(Optional)</span>
          </label>
          <select id="gender" v-model="form.gender" :style="inp('gender')" :disabled="isSubmitting">
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <span v-if="errors.gender" :style="s.error">{{ errors.gender }}</span>
        </div>

        <div :style="s.field">
          <label :style="s.label" for="dateOfBirth">
            Date of Birth <span :style="s.optional">(Optional)</span>
          </label>
          <input id="dateOfBirth" v-model="form.dateOfBirth" type="date" :style="inp('dateOfBirth')"
            :disabled="isSubmitting" />
          <span v-if="errors.dateOfBirth" :style="s.error">{{ errors.dateOfBirth }}</span>
        </div>

        <div :style="s.field">
          <label :style="s.label" for="location">
            Location <span :style="s.optional">(Optional)</span>
          </label>
          <input id="location" v-model="form.location" type="text" :style="inp('location')"
            placeholder="Enter your location" autocomplete="street-address" :disabled="isSubmitting" />
          <span v-if="errors.location" :style="s.error">{{ errors.location }}</span>
        </div>

        <!-- Password -->
        <div :style="s.field">
          <label :style="s.label" for="password">Password</label>
          <div :style="s.passwordWrap">
            <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'"
              :style="inp('password', s.inputPassword)"
              placeholder="Enter a strong password" autocomplete="new-password" :disabled="isSubmitting" />
            <button type="button" :style="s.toggle" @click="showPassword = !showPassword" :disabled="isSubmitting">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          <template v-if="strengthMeta">
            <div :style="s.strengthBar">
              <div :style="{ ...s.strengthFill, width: strengthMeta[1], background: strengthMeta[2] }" />
            </div>
            <small :style="{ ...s.strengthText, color: strengthMeta[2] }">Strength: {{ strengthMeta[0] }}</small>
          </template>
          <span v-if="errors.password" :style="s.error">{{ errors.password }}</span>
          <small :style="s.hint">At least 8 characters, must contain letters and numbers</small>
        </div>

        <!-- Confirm Password -->
        <div :style="s.field">
          <label :style="s.label" for="passwordConfirm">Confirm Password</label>
          <div :style="s.passwordWrap">
            <input id="passwordConfirm" v-model="form.passwordConfirm" :type="showConfirm ? 'text' : 'password'"
              :style="inp('passwordConfirm', s.inputPassword)"
              placeholder="Confirm your password" autocomplete="new-password" :disabled="isSubmitting" />
            <button type="button" :style="s.toggle" @click="showConfirm = !showConfirm" :disabled="isSubmitting">
              {{ showConfirm ? '🙈' : '👁️' }}
            </button>
          </div>
          <span v-if="errors.passwordConfirm" :style="s.error">{{ errors.passwordConfirm }}</span>
        </div>

        <!-- Terms -->
        <div :style="s.checkboxRow">
          <input v-model="form.agreeToTerms" type="checkbox" :style="s.checkboxInput" :disabled="isSubmitting" />
          <span>
            I agree to the
            <router-link to="/terms" :style="s.link">Terms and Conditions</router-link>
            and
            <router-link to="/privacy" :style="s.link">Privacy Policy</router-link>
          </span>
        </div>
        <span v-if="errors.agreeToTerms" :style="s.error">{{ errors.agreeToTerms }}</span>

        <!-- Submit -->
        <button type="button" :style="mx(s.btn, !isFormValid || loading ? s.primaryDisabled : s.primary)"
          :disabled="!isFormValid || loading" @click="submit">
          <template v-if="isSubmitting || loading">
            <span :style="s.spinner" /> Creating...
          </template>
          <template v-else>Create Account</template>
        </button>
      </div>

      <div :style="s.dividerWrap">
        <div :style="s.dividerLine" />
        <span :style="s.dividerText">Already have an account?</span>
      </div>

      <router-link to="/login" :style="mx(s.btn, s.secondary)">Sign In</router-link>
      <router-link to="/" :style="mx(s.btn, s.outline)">Return to Home</router-link>

    </div>
  </div>
</template>