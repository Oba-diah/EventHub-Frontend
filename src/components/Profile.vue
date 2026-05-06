<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

const isAuthenticated = computed(() => !!localStorage.getItem('token'))

const user = ref(null)
const success = ref('')
const error = ref('')
const bookings = ref([])
const savedEvents = ref([])
const loading = ref(false)
const pageReady = ref(false)

const isEditing = ref(false)
const isChangingPassword = ref(false)
const activeTab = ref('overview')
const profilePhoto = ref(null)
const profilePhotoFile = ref(null)

const editForm = ref({ name: '', phone: '', bio: '' })
const passwordForm = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })

const userInitials = computed(() => {
  if (!user.value?.name) return '?'
  return user.value.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
})

const upcomingBookings = computed(() => bookings.value.filter(b => new Date(b.event_date) >= new Date()))
const pastBookings = computed(() => bookings.value.filter(b => new Date(b.event_date) < new Date()))

const memberSince = computed(() => {
  if (!user.value?.created_at) return '—'
  return new Date(user.value.created_at).toLocaleDateString()
})

const clearAlerts = () => setTimeout(() => { success.value = ''; error.value = '' }, 3500)
const showSuccess = (msg) => { success.value = msg; error.value = ''; clearAlerts() }
const showError = (msg) => { error.value = msg; success.value = ''; clearAlerts() }

const fetchUser = async () => {
  try {
    const res = await api.get('/user')
    user.value = res.data
    editForm.value = { name: res.data.name, phone: res.data.phone || '', bio: res.data.bio || '' }
  } catch {
    showError('Failed to load profile')
  }
}

const fetchBookings = async () => {
  loading.value = true
  try {
    const res = await api.get('/bookings')
    bookings.value = res.data
  } catch {
    showError('Failed to load bookings')
  } finally {
    loading.value = false
  }
}

const updateProfile = async () => {
  try {
    const res = await api.put('/user', editForm.value)
    user.value = res.data
    showSuccess('Profile updated')
    isEditing.value = false
  } catch {
    showError('Update failed')
  }
}

const changePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) return showError('Passwords mismatch')
  try {
    await api.post('/change-password', passwordForm.value)
    showSuccess('Password updated')
    isChangingPassword.value = false
  } catch {
    showError('Failed')
  }
}

const handleLogout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}

const handlePhotoUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return
  profilePhoto.value = URL.createObjectURL(file)
}

const formatDate = (date) => new Date(date).toLocaleDateString()

onMounted(async () => {
  if (!isAuthenticated.value) return router.push('/login')
  await Promise.all([fetchUser(), fetchBookings()])
  pageReady.value = true
})

const pageStyle = {
  minHeight: '100vh',
  background: '#0f1117',
  color: '#e8eaf2',
  fontFamily: 'sans-serif',
  padding: '20px'
}

const card = {
  background: '#181c27',
  padding: '20px',
  borderRadius: '10px',
  marginBottom: '20px'
}

const btn = {
  padding: '10px',
  border: 'none',
  cursor: 'pointer',
  marginRight: '10px'
}
</script>

<template>
<div :style="pageStyle">

  <div v-if="!isAuthenticated" :style="{textAlign:'center'}">
    <h2>Login required</h2>
    <router-link to="/login">Go Login</router-link>
  </div>

  <div v-else>

    <div v-if="success" :style="{background:'green',padding:'10px'}">{{ success }}</div>
    <div v-if="error" :style="{background:'red',padding:'10px'}">{{ error }}</div>

    <div :style="card">
      <h2>{{ user?.name }}</h2>
      <p>{{ user?.email }}</p>

      <div>
        <button :style="{...btn, background:'#5b8dee', color:'white'}" @click="isEditing=true">Edit</button>
        <button v-if="isEditing" :style="{...btn, background:'green'}" @click="updateProfile">Save</button>
      </div>
    </div>

    <div :style="card">
      <button @click="activeTab='overview'">Overview</button>
      <button @click="activeTab='bookings'">Bookings</button>
      <button @click="activeTab='security'">Security</button>
    </div>

    <div :style="card">

      <div v-if="activeTab==='overview'">
        <p>Name: {{ user?.name }}</p>
        <p>Email: {{ user?.email }}</p>
      </div>

      <div v-if="activeTab==='bookings'">
        <div v-if="loading">Loading...</div>
        <div v-else>
          <div v-for="b in bookings" :key="b.id" :style="{border:'1px solid #333',padding:'10px'}">
            <h4>{{ b.event_title }}</h4>
            <p>{{ formatDate(b.event_date) }}</p>
          </div>
        </div>
      </div>

      <div v-if="activeTab==='security'">
        <button @click="isChangingPassword=true">Change Password</button>

        <div v-if="isChangingPassword">
          <input v-model="passwordForm.currentPassword" placeholder="Current"/>
          <input v-model="passwordForm.newPassword" placeholder="New"/>
          <input v-model="passwordForm.confirmPassword" placeholder="Confirm"/>
          <button @click="changePassword">Update</button>
        </div>

        <button @click="handleLogout">Logout</button>
      </div>

    </div>

  </div>
</div>
</template>