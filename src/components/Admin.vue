<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const token = localStorage.getItem('authToken')

// ================= STATE =================
const tab = ref(1)
const error = ref('')
const loading = ref(false)

// dialogs
const showAddEventDialog = ref(false)
const showEditEventDialog = ref(false)

// ================= USERS =================
const users = ref([])

async function fetchUsers() {
  try {
    const res = await api.get('users', {
      headers: { Authorization: `Bearer ${token}` }
    })
    users.value = res.data || []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to fetch users'
  }
}

// ================= EVENTS =================
const events = ref([])
const eventId = ref(null)

const eventTitle = ref('')
const eventDate = ref('')
const eventLocation = ref('')
const eventPrice = ref('')
const eventDescription = ref('')

async function fetchEvents() {
  try {
    const res = await api.get('events')
    events.value = res.data || []
  } catch (err) {
    error.value = 'Failed to fetch events'
  }
}

async function addEvent() {
  try {
    await api.post(
      'events',
      {
        title: eventTitle.value,
        date: eventDate.value,
        location: eventLocation.value,
        price: eventPrice.value,
        description: eventDescription.value
      },
      { headers: { Authorization: `Bearer ${token}` } }
    )

    close()
    fetchEvents()
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to create event'
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
    await api.put(
      `events/${eventId.value}`,
      {
        title: eventTitle.value,
        date: eventDate.value,
        location: eventLocation.value,
        price: eventPrice.value,
        description: eventDescription.value
      },
      { headers: { Authorization: `Bearer ${token}` } }
    )

    close()
    fetchEvents()
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to update event'
  }
}

// ================= BOOKINGS =================
const bookings = ref([])

async function fetchBookings() {
  try {
    const res = await api.get('bookings', {
      headers: { Authorization: `Bearer ${token}` }
    })
    bookings.value = res.data || []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to fetch bookings'
  }
}

// ================= RESET =================
function close() {
  showAddEventDialog.value = false
  showEditEventDialog.value = false

  eventTitle.value = ''
  eventDate.value = ''
  eventLocation.value = ''
  eventPrice.value = ''
  eventDescription.value = ''
}

// ================= INIT =================
onMounted(() => {
  fetchUsers()
  fetchEvents()
  fetchBookings()
})
</script>

<template>
  <v-container class="mt-10">

    <!-- ERROR -->
    <v-alert v-if="error" type="error" class="mb-4">
      {{ error }}
    </v-alert>

    <v-card>
      <!-- TABS -->
      <v-tabs v-model="tab" align-tabs="center" color="primary">
        <v-tab :value="1">Users</v-tab>
        <v-tab :value="2">Events</v-tab>
        <v-tab :value="3">Bookings</v-tab>
      </v-tabs>

      <v-tabs-window v-model="tab">

        <!-- USERS -->
        <v-tabs-window-item :value="1">
          <v-table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u.id">
                <td>{{ u.name }}</td>
                <td>{{ u.email }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-tabs-window-item>

        <!-- EVENTS -->
        <v-tabs-window-item :value="2">
          <v-container>
            <v-row>
              <v-col align="right">
                <v-btn icon="mdi-plus" @click="showAddEventDialog = true"></v-btn>
              </v-col>
            </v-row>

            <v-table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="e in events" :key="e.id">
                  <td>{{ e.title }}</td>
                  <td>{{ e.date }}</td>
                  <td>{{ e.location }}</td>
                  <td>{{ e.price }}</td>

                  <td>
                    <v-btn size="small" @click="editEvent(e)">Edit</v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-container>
        </v-tabs-window-item>

        <!-- BOOKINGS -->
        <v-tabs-window-item :value="3">
          <v-table>
            <thead>
              <tr>
                <th>User</th>
                <th>Event</th>
                <th>Date</th>
                <th>Tickets</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="b in bookings" :key="b.id">
                <td>{{ b.user_name }}</td>
                <td>{{ b.event_title }}</td>
                <td>{{ b.event_date }}</td>
                <td>{{ b.quantity }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-tabs-window-item>

      </v-tabs-window>
    </v-card>

    <!-- ADD EVENT -->
    <v-dialog v-model="showAddEventDialog" max-width="600">
      <v-card>
        <v-card-title>Add Event</v-card-title>

        <v-card-text>
          <v-text-field label="Title" v-model="eventTitle" />
          <v-text-field label="Location" v-model="eventLocation" />
          <v-text-field label="Price" v-model="eventPrice" />
          <v-date-input label="Date" v-model="eventDate" />
          <v-textarea label="Description" v-model="eventDescription" />
        </v-card-text>

        <v-card-actions>
          <v-btn @click="close()">Cancel</v-btn>
          <v-btn @click="addEvent()">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- EDIT EVENT -->
    <v-dialog v-model="showEditEventDialog" max-width="600">
      <v-card>
        <v-card-title>Edit Event</v-card-title>

        <v-card-text>
          <v-text-field label="Title" v-model="eventTitle" />
          <v-text-field label="Location" v-model="eventLocation" />
          <v-text-field label="Price" v-model="eventPrice" />
          <v-date-input label="Date" v-model="eventDate" />
          <v-textarea label="Description" v-model="eventDescription" />
        </v-card-text>

        <v-card-actions>
          <v-btn @click="close()">Cancel</v-btn>
          <v-btn @click="updateEvent()">Update</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>