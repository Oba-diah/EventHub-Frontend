<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const tab = ref(1)
const error = ref('')
const loading = ref(false)

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
const eventLocation = ref('')
const eventPrice = ref('')
const eventDescription = ref('')

async function fetchUsers() {
  try {
    const res = await api.get('users')
    users.value = res.data || []
  } catch {
    error.value = 'Failed to load users'
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
    fetchUsers()
  } catch {
    error.value = 'Failed to create user'
  }
}

async function fetchEvents() {
  try {
    const res = await api.get('events')
    events.value = res.data || []
  } catch {
    error.value = 'Failed to load events'
  }
}

async function addEvent() {
  try {
    await api.post('events', {
      title: eventTitle.value,
      date: eventDate.value,
      location: eventLocation.value,
      price: eventPrice.value,
      description: eventDescription.value
    })

    showAddEventDialog.value = false
    resetEventForm()
    fetchEvents()
  } catch {
    error.value = 'Failed to create event'
  }
}

function editEvent(e) {
  eventId.value = e.id
  eventTitle.value = e.title
  eventDate.value = e.date
  eventLocation.value = e.location
  eventPrice.value = e.price
  eventDescription.value = e.description
  showEditEventDialog.value = true
}

async function updateEvent() {
  try {
    await api.put(`events/${eventId.value}`, {
      title: eventTitle.value,
      date: eventDate.value,
      location: eventLocation.value,
      price: eventPrice.value,
      description: eventDescription.value
    })

    showEditEventDialog.value = false
    resetEventForm()
    fetchEvents()
  } catch {
    error.value = 'Failed to update event'
  }
}

async function fetchBookings() {
  try {
    const res = await api.get('bookings')
    bookings.value = res.data || []
  } catch {
    error.value = 'Failed to load bookings'
  }
}

function resetEventForm() {
  eventId.value = null
  eventTitle.value = ''
  eventDate.value = ''
  eventLocation.value = ''
  eventPrice.value = ''
  eventDescription.value = ''
}

onMounted(() => {
  fetchUsers()
  fetchEvents()
  fetchBookings()
})
</script>

<template>
  <v-container class="mt-10">

    <v-alert v-if="error" type="error">{{ error }}</v-alert>

    <v-card>
      <v-tabs v-model="tab">
        <v-tab :value="1">Users</v-tab>
        <v-tab :value="2">Events</v-tab>
        <v-tab :value="3">Bookings</v-tab>
      </v-tabs>

      <v-tabs-window v-model="tab">

        <v-tabs-window-item :value="1">
          <v-btn @click="showUserDialog = true">Add User</v-btn>

          <v-table>
            <tr v-for="u in users" :key="u.id">
              <td>{{ u.name }}</td>
              <td>{{ u.email }}</td>
            </tr>
          </v-table>
        </v-tabs-window-item>

        <v-tabs-window-item :value="2">
          <v-btn @click="showAddEventDialog = true">Add Event</v-btn>

          <v-table>
            <tr v-for="e in events" :key="e.id">
              <td>{{ e.title }}</td>
              <td>{{ e.date }}</td>
              <td>
                <v-btn @click="editEvent(e)">Edit</v-btn>
              </td>
            </tr>
          </v-table>
        </v-tabs-window-item>

        <v-tabs-window-item :value="3">
          <v-table>
            <tr v-for="b in bookings" :key="b.id">
              <td>{{ b.user_name }}</td>
              <td>{{ b.event_title }}</td>
              <td>{{ b.quantity }}</td>
            </tr>
          </v-table>
        </v-tabs-window-item>

      </v-tabs-window>
    </v-card>

    <v-dialog v-model="showUserDialog">
      <v-card>
        <v-card-title>Create User</v-card-title>

        <v-card-text>
          <v-text-field v-model="userName" label="Name" />
          <v-text-field v-model="userEmail" label="Email" />
          <v-text-field v-model="userPassword" label="Password" type="password" />
        </v-card-text>

        <v-card-actions>
          <v-btn @click="createUser">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showAddEventDialog">
      <v-card>
        <v-card-title>Add Event</v-card-title>

        <v-card-text>
          <v-text-field v-model="eventTitle" label="Title" />
          <v-text-field v-model="eventLocation" label="Location" />
          <v-text-field v-model="eventPrice" label="Price" />
          <v-text-field v-model="eventDate" label="Date" />
          <v-textarea v-model="eventDescription" label="Description" />
        </v-card-text>

        <v-card-actions>
          <v-btn @click="addEvent">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showEditEventDialog">
      <v-card>
        <v-card-title>Edit Event</v-card-title>

        <v-card-text>
          <v-text-field v-model="eventTitle" label="Title" />
          <v-text-field v-model="eventLocation" label="Location" />
          <v-text-field v-model="eventPrice" label="Price" />
          <v-text-field v-model="eventDate" label="Date" />
          <v-textarea v-model="eventDescription" label="Description" />
        </v-card-text>

        <v-card-actions>
          <v-btn @click="updateEvent">Update</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>