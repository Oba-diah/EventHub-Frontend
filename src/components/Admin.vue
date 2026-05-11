<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

const tab = ref(1)
const loading = ref(false)
const error = ref('')

const showUserDialog = ref(false)
const showAddEventDialog = ref(false)
const showEditEventDialog = ref(false)

const users = ref([])
const events = ref([])
const bookings = ref([])

const userName = ref('')
const userEmail = ref('')
const userPassword = ref('')
const userRole = ref(2)

const eventId = ref(null)
const eventTitle = ref('')
const eventDate = ref('')
const eventTime = ref('')
const eventLocation = ref('')
const eventPrice = ref('')
const eventAvailableTickets = ref('')
const eventImage = ref('')
const eventDescription = ref('')

const isUserFormValid = computed(() =>
  userName.value.trim() && userEmail.value.trim() && userPassword.value.trim()
)

const isEventFormValid = computed(() =>
  eventTitle.value.trim() && eventDate.value && eventTime.value &&
  eventLocation.value.trim() && eventPrice.value && eventAvailableTickets.value
)

onMounted(() => {
  fetchUsers()
  fetchEvents()
  fetchBookings()
})

function resetEventForm() {
  eventId.value = null
  eventTitle.value = ''
  eventDate.value = ''
  eventTime.value = ''
  eventLocation.value = ''
  eventPrice.value = ''
  eventAvailableTickets.value = ''
  eventImage.value = ''
  eventDescription.value = ''
}

async function fetchUsers() {
  try {
    loading.value = true
    const res = await api.get('users')
    users.value = res.data || []
  } catch {
    error.value = 'Failed to load users'
  } finally {
    loading.value = false
  }
}

async function createUser() {
  try {
    await api.post('users', {
      name: userName.value,
      email: userEmail.value,
      password: userPassword.value,
      role_id: userRole.value
    })
    showUserDialog.value = false
    userName.value = ''
    userEmail.value = ''
    userPassword.value = ''
    userRole.value = 2
    await fetchUsers()
  } catch {
    error.value = 'Failed to create user'
  }
}

async function fetchEvents() {
  try {
    loading.value = true
    const res = await api.get('events')
    events.value = res.data || []
  } catch {
    error.value = 'Failed to load events'
  } finally {
    loading.value = false
  }
}

async function addEvent() {
  try {
    await api.post('events', {
      title: eventTitle.value,
      description: eventDescription.value,
      date: eventDate.value,
      time: eventTime.value,
      location: eventLocation.value,
      image: eventImage.value || 'https://via.placeholder.com/600',
      price: eventPrice.value,
      available_tickets: eventAvailableTickets.value
    })
    showAddEventDialog.value = false
    resetEventForm()
    await fetchEvents()
  } catch {
    error.value = 'Failed to create event'
  }
}

function editEvent(e) {
  eventId.value = e.id
  eventTitle.value = e.title
  eventDate.value = e.date
  eventTime.value = e.time || ''
  eventLocation.value = e.location
  eventPrice.value = e.price
  eventAvailableTickets.value = e.available_tickets || ''
  eventImage.value = e.image || ''
  eventDescription.value = e.description
  showEditEventDialog.value = true
}

async function updateEvent() {
  try {
    await api.put(`events/${eventId.value}`, {
      title: eventTitle.value,
      description: eventDescription.value,
      date: eventDate.value,
      time: eventTime.value,
      location: eventLocation.value,
      image: eventImage.value || 'https://via.placeholder.com/600',
      price: eventPrice.value,
      available_tickets: eventAvailableTickets.value
    })
    showEditEventDialog.value = false
    resetEventForm()
    await fetchEvents()
  } catch {
    error.value = 'Failed to update event'
  }
}

async function fetchBookings() {
  try {
    loading.value = true
    const res = await api.get('bookings')
    bookings.value = res.data || []
  } catch {
    error.value = 'Failed to load bookings'
  } finally {
    loading.value = false
  }
}

const s = {
  wrapper: { minHeight: '100vh', background: '#f9fafb', padding: '2rem 1rem', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  container: { maxWidth: '1200px', margin: '0 auto' },
  header: { marginBottom: '2rem' },
  h1: { fontSize: '2rem', fontWeight: 700, color: '#111827', margin: 0 },
  tabs: { display: 'flex', gap: '1rem', borderBottom: '2px solid #e5e7eb', marginBottom: '2rem' },
  tab: { padding: '1rem 1.5rem', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, color: '#6b7280', borderBottom: '2px solid transparent', marginBottom: '-2px' },
  tabActive: { color: '#667eea', borderBottomColor: '#667eea' },
  card: { background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem' },
  alert: { padding: '1rem 1.25rem', borderRadius: '8px', background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', marginBottom: '1.5rem' },
  btn: { padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, border: 'none', cursor: 'pointer' },
  btnPrimary: { background: '#667eea', color: 'white' },
  btnSecondary: { background: '#e5e7eb', color: '#1f2937' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '1rem', textAlign: 'left', background: '#f3f4f6', fontWeight: 600, color: '#374151', borderBottom: '2px solid #e5e7eb' },
  td: { padding: '1rem', borderBottom: '1px solid #e5e7eb', color: '#374151' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  input: { padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', outline: 'none' },
}

const mx = (...objs) => Object.assign({}, ...objs)
</script>

<template>
  <div :style="s.wrapper">
    <div :style="s.container">

      <div :style="s.header">
        <h1 :style="s.h1">Admin Dashboard</h1>
      </div>

      <div v-if="error" :style="s.alert">{{ error }}</div>

      <div :style="s.tabs">
        <button v-for="(label, i) in ['Users', 'Events', 'Bookings']" :key="i"
          :style="mx(s.tab, tab === i + 1 && s.tabActive)" @click="tab = i + 1">
          {{ label }}
        </button>
      </div>

      <!-- USERS -->
      <div v-if="tab === 1">
        <button :style="mx(s.btn, s.btnPrimary)" @click="showUserDialog = true">Add User</button>
        <div :style="s.card">
          <table :style="s.table">
            <thead>
              <tr>
                <th :style="s.th">Name</th>
                <th :style="s.th">Email</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u.id">
                <td :style="s.td">{{ u.name }}</td>
                <td :style="s.td">{{ u.email }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- EVENTS -->
      <div v-if="tab === 2">
        <button :style="mx(s.btn, s.btnPrimary)" @click="showAddEventDialog = true">Add Event</button>
        <div :style="s.card">
          <table :style="s.table">
            <thead>
              <tr>
                <th :style="s.th">Title</th>
                <th :style="s.th">Date</th>
                <th :style="s.th">Location</th>
                <th :style="s.th">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="e in events" :key="e.id">
                <td :style="s.td">{{ e.title }}</td>
                <td :style="s.td">{{ e.date }}</td>
                <td :style="s.td">{{ e.location }}</td>
                <td :style="s.td">
                  <button :style="mx(s.btn, s.btnSecondary)" @click="editEvent(e)">Edit</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- BOOKINGS -->
      <div v-if="tab === 3">
        <div :style="s.card">
          <table :style="s.table">
            <thead>
              <tr>
                <th :style="s.th">User</th>
                <th :style="s.th">Event</th>
                <th :style="s.th">Tickets</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in bookings" :key="b.id">
                <td :style="s.td">{{ b.user_name }}</td>
                <td :style="s.td">{{ b.event_title }}</td>
                <td :style="s.td">{{ b.quantity }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- USER DIALOG -->
      <div v-if="showUserDialog" :style="s.card">
        <h3>Create User</h3>
        <div :style="s.form">
          <input :style="s.input" v-model="userName" placeholder="Name" />
          <input :style="s.input" v-model="userEmail" placeholder="Email" />
          <input :style="s.input" v-model="userPassword" placeholder="Password" type="password" />
          <button :style="mx(s.btn, s.btnPrimary)" :disabled="!isUserFormValid" @click="createUser">Save</button>
          <button :style="mx(s.btn, s.btnSecondary)" @click="showUserDialog = false">Cancel</button>
        </div>
      </div>

      <!-- ADD EVENT DIALOG -->
      <div v-if="showAddEventDialog" :style="s.card">
        <h3>Add Event</h3>
        <div :style="s.form">
          <input :style="s.input" v-model="eventTitle" placeholder="Title" />
          <input :style="s.input" v-model="eventDate" placeholder="Date" type="date" />
          <input :style="s.input" v-model="eventTime" placeholder="Time" type="time" />
          <input :style="s.input" v-model="eventLocation" placeholder="Location" />
          <input :style="s.input" v-model="eventPrice" placeholder="Price" type="number" />
          <input :style="s.input" v-model="eventAvailableTickets" placeholder="Available Tickets" type="number" />
          <input :style="s.input" v-model="eventImage" placeholder="Image URL (optional)" />
          <input :style="s.input" v-model="eventDescription" placeholder="Description" />
          <button :style="mx(s.btn, s.btnPrimary)" :disabled="!isEventFormValid" @click="addEvent">Save</button>
          <button :style="mx(s.btn, s.btnSecondary)" @click="showAddEventDialog = false">Cancel</button>
        </div>
      </div>

      <!-- EDIT EVENT DIALOG -->
      <div v-if="showEditEventDialog" :style="s.card">
        <h3>Edit Event</h3>
        <div :style="s.form">
          <input :style="s.input" v-model="eventTitle" placeholder="Title" />
          <input :style="s.input" v-model="eventDate" placeholder="Date" type="date" />
          <input :style="s.input" v-model="eventTime" placeholder="Time" type="time" />
          <input :style="s.input" v-model="eventLocation" placeholder="Location" />
          <input :style="s.input" v-model="eventPrice" placeholder="Price" type="number" />
          <input :style="s.input" v-model="eventAvailableTickets" placeholder="Available Tickets" type="number" />
          <input :style="s.input" v-model="eventImage" placeholder="Image URL (optional)" />
          <input :style="s.input" v-model="eventDescription" placeholder="Description" />
          <button :style="mx(s.btn, s.btnPrimary)" :disabled="!isEventFormValid" @click="updateEvent">Update</button>
          <button :style="mx(s.btn, s.btnSecondary)" @click="showEditEventDialog = false">Cancel</button>
        </div>
      </div>

    </div>
  </div>
</template>