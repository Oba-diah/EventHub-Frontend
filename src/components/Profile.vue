<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

// ── Router ────────────────────────────────────────────────────────────────────
const router = useRouter()

// ── State ──────────────────────────────────────────────────────────────────────
const user = ref(null)
const events = ref([])
const loading = ref(false)
const error = ref('')

// ── Lifecycle ──────────────────────────────────────────────────────────────────
onMounted(async () => {
  if (!localStorage.getItem('token')) {
    router.push('/login')
    return
  }
  await Promise.all([fetchUser(), fetchRecentEvents()])
})

// ── Methods ────────────────────────────────────────────────────────────────────
function authHeaders() {
  const token = localStorage.getItem('token')
  return { headers: { Authorization: `Bearer ${token}` } }
}

async function fetchUser() {
  try {
    const res = await api.get('user', authHeaders())
    user.value = res.data
  } catch (err) {
    error.value = 'Failed to load user details'
  }
}

async function fetchRecentEvents() {
  try {
    loading.value = true
    const res = await api.get('bookings', authHeaders())
    events.value = res.data || []
  } catch (err) {
    error.value = 'Failed to load events'
  } finally {
    loading.value = false
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('otpEmail')
  localStorage.removeItem('otpPassword')
  localStorage.removeItem('isAdmin')
  router.push('/login')
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  wrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    padding: '2rem 1rem',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  header: {
    background: 'white',
    borderRadius: '12px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 10px 40px rgba(0,0,0,.15)',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
  },
  userInfo: {
    flex: 1,
  },
  h1: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#1f2937',
    margin: '0 0 .5rem',
  },
  email: {
    color: '#6b7280',
    fontSize: '1.05rem',
    margin: '0 0 1rem',
  },
  logoutBtn: {
    padding: '.75rem 1.5rem',
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  userDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid #e5e7eb',
  },
  detail: {
    display: 'flex',
    flexDirection: 'column',
    gap: '.25rem',
  },
  detailLabel: {
    fontSize: '.85rem',
    color: '#9ca3af',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: '1.1rem',
    color: '#374151',
    fontWeight: 500,
  },
  section: {
    background: 'white',
    borderRadius: '12px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 10px 40px rgba(0,0,0,.15)',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#1f2937',
    marginBottom: '1.5rem',
    borderBottom: '2px solid #667eea',
    paddingBottom: '.75rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem 1rem',
    color: '#9ca3af',
  },
  eventCard: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '1.5rem',
    marginBottom: '1rem',
    transition: 'all 0.2s',
  },
  eventTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#1f2937',
    marginBottom: '.5rem',
  },
  eventDate: {
    fontSize: '.95rem',
    color: '#667eea',
    fontWeight: 600,
    marginBottom: '.5rem',
  },
  eventLocation: {
    fontSize: '.9rem',
    color: '#6b7280',
    marginBottom: '1rem',
  },
  loadingText: {
    textAlign: 'center',
    color: '#9ca3af',
    padding: '2rem',
  },
  errorAlert: {
    padding: '1rem 1.25rem',
    background: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    color: '#991b1b',
    marginBottom: '1.5rem',
  },
}

const mx = (...objs) => Object.assign({}, ...objs)
</script>

<template>
  <div :style="s.wrapper">
    <div :style="s.container">

      <!-- Error Alert -->
      <div v-if="error" :style="s.errorAlert" role="alert">
        {{ error }}
      </div>

      <!-- User Header Card -->
      <div :style="s.header">
        <div :style="s.headerTop">
          <div :style="s.userInfo">
            <h1 :style="s.h1">{{ user?.name || 'User Profile' }}</h1>
            <p :style="s.email">{{ user?.email }}</p>
          </div>
          <button :style="s.logoutBtn" @click="logout">
            Logout
          </button>
        </div>

        <!-- User Details Grid -->
        <div v-if="user" :style="s.userDetails">
          <div :style="s.detail">
            <span :style="s.detailLabel">Phone</span>
            <span :style="s.detailValue">{{ user.phone || '—' }}</span>
          </div>
          <div :style="s.detail">
            <span :style="s.detailLabel">Member Since</span>
            <span :style="s.detailValue">{{ formatDate(user.created_at) }}</span>
          </div>
          <div :style="s.detail">
            <span :style="s.detailLabel">Status</span>
            <span :style="s.detailValue">Active</span>
          </div>
        </div>
      </div>

      <!-- Recent Events Section -->
      <div :style="s.section">
        <h2 :style="s.sectionTitle">Recent Events</h2>

        <div v-if="loading" :style="s.loadingText">
          Loading your events...
        </div>

        <div v-else-if="events.length === 0" :style="s.emptyState">
          <p>You haven't booked any events yet.</p>
          <router-link to="/events" style="color: #667eea; textDecoration: 'underline'">
            Browse events
          </router-link>
        </div>

        <div v-else>
          <div v-for="event in events" :key="event.id" :style="s.eventCard">
            <div :style="s.eventTitle">{{ event.event_title }}</div>
            <div :style="s.eventDate">📅 {{ formatDate(event.event_date) }}</div>
            <div :style="s.eventLocation">📍 {{ event.event_location || 'Location TBA' }}</div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>