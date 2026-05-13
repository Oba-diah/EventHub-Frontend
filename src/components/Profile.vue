<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

const user = ref(null)
const events = ref([])
const loading = ref(false)
const error = ref('')
const removingId = ref(null)
const confirmDeleteId = ref(null)

onMounted(async () => {
  if (!localStorage.getItem('token')) {
    router.push('/login')
    return
  }
  await Promise.all([fetchUser(), fetchRecentEvents()])
})

function authHeaders() {
  const token = localStorage.getItem('token')
  return { headers: { Authorization: `Bearer ${token}` } }
}

async function fetchUser() {
  try {
    const res = await api.get('user', authHeaders())
    user.value = res.data.user
  } catch (err) {
    error.value = 'Failed to load user details'
  }
}

async function fetchRecentEvents() {
  try {
    loading.value = true
    const res = await api.get('bookings', authHeaders())
    const bookings = res.data || []

    const enriched = await Promise.all(
      bookings.map(async (booking) => {
        try {
          const eventRes = await api.get(`events/${booking.event_id}`, authHeaders())
          const eventData = eventRes.data?.event || eventRes.data
          return { ...booking, ...eventData, booking_id: booking.id }
        } catch {
          return { ...booking, booking_id: booking.id }
        }
      })
    )
    events.value = enriched
  } catch (err) {
    error.value = 'Failed to load bookings'
  } finally {
    loading.value = false
  }
}

function formatDate(date) {
  if (!date) return 'Date TBA'
  const d = new Date(date)
  if (isNaN(d)) return 'Date TBA'
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatPrice(price) {
  return parseFloat(price).toLocaleString('en-KE', { style: 'currency', currency: 'KES' })
}

function statusColor(status) {
  const map = {
    pending:   { background: '#fef9c3', color: '#854d0e' },
    confirmed: { background: '#dcfce7', color: '#166534' },
    cancelled: { background: '#fee2e2', color: '#991b1b' },
  }
  return map[status] || { background: '#f1f5f9', color: '#475569' }
}

function logout() {
  ['token', 'user', 'otpEmail', 'otpPassword', 'isAdmin'].forEach(k => localStorage.removeItem(k))
  router.push('/login')
}

function askConfirm(bookingId) {
  confirmDeleteId.value = bookingId
}

function cancelConfirm() {
  confirmDeleteId.value = null
}

async function removeBooking(bookingId) {
  removingId.value = bookingId
  confirmDeleteId.value = null
  try {
    await api.delete(`bookings/${bookingId}`, authHeaders())
    events.value = events.value.filter(e => e.booking_id !== bookingId)
  } catch (err) {
    error.value = 'Failed to remove booking. Please try again.'
  } finally {
    removingId.value = null
  }
}

const s = {
  wrapper: {
    minHeight: '100vh',
    background: '#eef5ff',
    padding: '2rem 1rem',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  container: { maxWidth: '900px', margin: '0 auto' },
  header: {
    background: 'white',
    borderRadius: '18px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  userInfo: { flex: '1 1 320px' },
  h1: { fontSize: '2rem', fontWeight: 700, color: '#102a43', margin: '0 0 0.5rem' },
  logoutBtn: {
    padding: '0.75rem 1.5rem',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '999px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid #dbeafe',
  },
  detail: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  label: { fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' },
  value: { fontSize: '1rem', color: '#0f172a', fontWeight: 600 },
  section: {
    background: 'white',
    borderRadius: '18px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
  },
  sectionTitle: {
    fontSize: '1.3rem',
    fontWeight: 700,
    color: '#102a43',
    marginBottom: '1.5rem',
    borderBottom: '2px solid #c7d2fe',
    paddingBottom: '0.75rem',
  },
  emptyState: { textAlign: 'center', padding: '2rem 1rem', color: '#64748b' },
  eventCard: {
    background: '#f8fbff',
    border: '1px solid #dbeafe',
    borderRadius: '14px',
    padding: '1.5rem',
    marginBottom: '1rem',
    position: 'relative',
  },
  eventCardRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' },
  eventDate: { fontSize: '0.95rem', color: '#2563eb', fontWeight: 600, marginBottom: '0.5rem' },
  eventLocation: { fontSize: '0.9rem', color: '#475569', marginBottom: '0.5rem' },
  eventMeta: { display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.75rem' },
  metaItem: { fontSize: '0.85rem', color: '#475569' },
  statusBadge: {
    display: 'inline-block',
    padding: '0.2rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: 700,
    textTransform: 'capitalize',
  },
  removeBtn: {
    padding: '0.4rem 0.9rem',
    background: 'transparent',
    color: '#dc2626',
    border: '1px solid #fca5a5',
    borderRadius: '8px',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  confirmBox: {
    marginTop: '1rem',
    padding: '0.75rem 1rem',
    background: '#fff1f2',
    border: '1px solid #fecdd3',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  confirmText: { fontSize: '0.88rem', color: '#9f1239', flex: 1 },
  confirmYes: {
    padding: '0.35rem 0.9rem',
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '7px',
    fontSize: '0.82rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  confirmNo: {
    padding: '0.35rem 0.9rem',
    background: 'white',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '7px',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  loadingText: { textAlign: 'center', color: '#64748b', padding: '2rem' },
  errorAlert: {
    padding: '1rem 1.25rem',
    background: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    color: '#991b1b',
    marginBottom: '1.5rem',
  },
}
</script>

<template>
  <div :style="s.wrapper">
    <div :style="s.container">

      <div v-if="error" :style="s.errorAlert" role="alert">{{ error }}</div>

      <!-- User Header Card -->
      <div :style="s.header">
        <div :style="s.headerTop">
          <div :style="s.userInfo">
            <h1 :style="s.h1">{{ user?.name || 'User Profile' }}</h1>
          </div>
          <button :style="s.logoutBtn" @click="logout">Logout</button>
        </div>

        <div v-if="user" :style="s.detailGrid">
          <div :style="s.detail">
            <span :style="s.label">Email</span>
            <span :style="s.value">{{ user.email }}</span>
          </div>
          <div :style="s.detail">
            <span :style="s.label">Password</span>
            <span :style="s.value">••••••••</span>
          </div>
        </div>
      </div>

      <!-- Recent Bookings Section -->
      <div :style="s.section">
        <h2 :style="s.sectionTitle">Recent Bookings</h2>

        <div v-if="loading" :style="s.loadingText">Loading your bookings...</div>

        <div v-else-if="events.length === 0" :style="s.emptyState">
          <p>You haven't booked any events yet.</p>
          <router-link to="/events" style="color: #2563eb">Browse events</router-link>
        </div>

        <div v-else>
          <div
            v-for="event in events"
            :key="event.booking_id"
            :style="{
              ...s.eventCard,
              opacity: removingId === event.booking_id ? 0.5 : 1,
              transition: 'opacity 0.2s'
            }"
          >
            <div :style="s.eventCardRow">
              <div :style="s.eventInfo">
                <div :style="s.eventTitle">{{ event.title || event.name || `Event #${event.event_id}` }}</div>
                <div :style="s.eventDate">📅 {{ formatDate(event.date || event.start_date || event.event_date) }}</div>
                <div :style="s.eventLocation">📍 {{ event.location || event.venue || 'Location TBA' }}</div>
                <div :style="s.eventMeta">
                  <span :style="s.metaItem">🎟 {{ event.tickets_booked }} ticket{{ event.tickets_booked !== 1 ? 's' : '' }}</span>
                  <span :style="s.metaItem">💰 {{ formatPrice(event.total_price) }}</span>
                  <span :style="{ ...s.statusBadge, ...statusColor(event.status) }">{{ event.status }}</span>
                </div>
              </div>

              <!-- Remove button -->
              <button
                :style="s.removeBtn"
                :disabled="removingId === event.booking_id"
                @click="askConfirm(event.booking_id)"
              >
                {{ removingId === event.booking_id ? 'Removing…' : 'Remove' }}
              </button>
            </div>

            <!-- Inline confirm prompt -->
            <div v-if="confirmDeleteId === event.booking_id" :style="s.confirmBox">
              <span :style="s.confirmText">Remove this booking? This cannot be undone.</span>
              <button :style="s.confirmNo" @click="cancelConfirm">Cancel</button>
              <button :style="s.confirmYes" @click="removeBooking(event.booking_id)">Yes, remove</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>