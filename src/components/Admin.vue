<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

const tab = ref(1)
const loading = ref(false)
const error = ref('')
const isAdmin = ref(false)

const showAddEventDialog = ref(false)
const showEditEventDialog = ref(false)

const users = ref([])
const events = ref([])
const bookings = ref([])

const deletingEventId = ref(null)
const confirmDeleteEventId = ref(null)

const eventId = ref(null)
const eventTitle = ref('')
const eventDate = ref('')
const eventTime = ref('')
const eventLocation = ref('')
const eventPrice = ref('')
const eventAvailableTickets = ref('')
const eventImage = ref('')
const eventDescription = ref('')

const isEventFormValid = computed(() =>
  eventTitle.value.trim() &&
  eventDate.value &&
  eventTime.value &&
  eventLocation.value.trim() &&
  eventPrice.value &&
  eventAvailableTickets.value
)

function authHeaders() {
  const token = localStorage.getItem('token')
  return { headers: { Authorization: `Bearer ${token}` } }
}

onMounted(async () => {
  await checkAdmin()
  if (isAdmin.value) {
    await Promise.all([fetchUsers(), fetchEvents(), fetchBookings()])
  }
})

async function checkAdmin() {
  try {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    const res = await api.get('/user', authHeaders())
    const user = res.data?.user || res.data
    const roleId = Number(user?.role_id)
    if (roleId === 1) { isAdmin.value = true } else { router.push('/') }
  } catch (err) {
    console.error('ADMIN CHECK ERROR:', err)
    router.push('/login')
  }
}

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
    const res = await api.get('/users', authHeaders())
    users.value = Array.isArray(res.data) ? res.data : res.data?.data || res.data?.users || []
  } catch (err) {
    error.value = 'Failed to load users'
  } finally {
    loading.value = false
  }
}

async function fetchEvents() {
  try {
    loading.value = true
    const res = await api.get('/events')
    events.value = Array.isArray(res.data) ? res.data : res.data?.data || res.data?.events || []
  } catch (err) {
    error.value = 'Failed to load events'
  } finally {
    loading.value = false
  }
}

async function fetchBookings() {
  try {
    loading.value = true
    const res = await api.get('/bookings/all', authHeaders())
    bookings.value = Array.isArray(res.data) ? res.data : res.data?.data || res.data?.bookings || []
  } catch (err) {
    error.value = 'Failed to load bookings'
  } finally {
    loading.value = false
  }
}

async function addEvent() {
  try {
    await api.post('/events', {
      title: eventTitle.value,
      description: eventDescription.value,
      date: eventDate.value,
      time: eventTime.value,
      location: eventLocation.value,
      image: eventImage.value || 'https://via.placeholder.com/600',
      price: eventPrice.value,
      available_tickets: eventAvailableTickets.value
    }, authHeaders())
    showAddEventDialog.value = false
    resetEventForm()
    await fetchEvents()
  } catch (err) {
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
    await api.put(`/events/${eventId.value}`, {
      title: eventTitle.value,
      description: eventDescription.value,
      date: eventDate.value,
      time: eventTime.value,
      location: eventLocation.value,
      image: eventImage.value || 'https://via.placeholder.com/600',
      price: eventPrice.value,
      available_tickets: eventAvailableTickets.value
    }, authHeaders())
    showEditEventDialog.value = false
    resetEventForm()
    await fetchEvents()
  } catch (err) {
    error.value = 'Failed to update event'
  }
}

function askConfirmDeleteEvent(id) { confirmDeleteEventId.value = id }
function cancelConfirmDeleteEvent() { confirmDeleteEventId.value = null }

async function deleteEvent(id) {
  deletingEventId.value = id
  confirmDeleteEventId.value = null
  try {
    await api.delete(`/events/${id}`, authHeaders())
    events.value = events.value.filter(e => e.id !== id)
  } catch (err) {
    error.value = 'Failed to delete event'
  } finally {
    deletingEventId.value = null
  }
}
</script>

<template>
  <v-app>
    <!-- Sidebar Navigation -->
    <v-navigation-drawer permanent color="grey-darken-4" width="220">
      <div class="pa-5 pb-3">
        <div class="text-overline text-medium-emphasis mb-1">Admin Panel</div>
        <div class="text-h6 font-weight-bold text-white">Dashboard</div>
      </div>

      <v-divider class="mb-2" />

      <v-list nav density="compact">
        <v-list-item
          prepend-icon="mdi-account-group"
          title="Users"
          value="1"
          :active="tab === 1"
          active-color="blue-lighten-2"
          rounded="lg"
          @click="tab = 1"
        />
        <v-list-item
          prepend-icon="mdi-calendar-star"
          title="Events"
          value="2"
          :active="tab === 2"
          active-color="blue-lighten-2"
          rounded="lg"
          @click="tab = 2"
        />
        <v-list-item
          prepend-icon="mdi-ticket-confirmation"
          title="Bookings"
          value="3"
          :active="tab === 3"
          active-color="blue-lighten-2"
          rounded="lg"
          @click="tab = 3"
        />
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main class="bg-grey-lighten-4">
      <!-- Top Bar -->
      <v-app-bar flat color="white" border="b">
        <v-app-bar-title>
          <span class="text-body-1 font-weight-medium text-grey-darken-3">
            {{ tab === 1 ? 'Users' : tab === 2 ? 'Events' : 'Bookings' }}
          </span>
        </v-app-bar-title>

        <template #append>
          <v-btn
            v-if="tab === 2"
            color="blue-darken-2"
            prepend-icon="mdi-plus"
            variant="flat"
            size="small"
            class="mr-3"
            @click="resetEventForm(); showAddEventDialog = true"
          >
            New Event
          </v-btn>
        </template>
      </v-app-bar>

      <v-container fluid class="pa-6">
        <!-- Error Alert -->
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          closable
          class="mb-4"
          @click:close="error = ''"
        >
          {{ error }}
        </v-alert>

        <!-- Loading Overlay -->
        <div v-if="loading" class="d-flex justify-center align-center" style="min-height: 300px">
          <v-progress-circular indeterminate color="blue-darken-2" size="48" />
        </div>

        <template v-else>
          <!-- ───── USERS TAB ───── -->
          <div v-if="tab === 1">
            <v-card rounded="xl" elevation="0" border>
              <v-data-table
                :items="users"
                :headers="[
                  { title: 'ID', key: 'id', width: 80 },
                  { title: 'Name', key: 'name' },
                  { title: 'Email', key: 'email' },
                  { title: 'Role', key: 'role_id', width: 120 },
                ]"
                item-value="id"
                hover
              >
                <template #item.role_id="{ item }">
                  <v-chip
                    :color="item.role_id === 1 ? 'blue-darken-1' : 'grey'"
                    size="small"
                    variant="tonal"
                  >
                    {{ item.role_id === 1 ? 'Admin' : 'User' }}
                  </v-chip>
                </template>

                <template #no-data>
                  <div class="text-center pa-8 text-medium-emphasis">
                    <v-icon size="40" class="mb-2">mdi-account-off</v-icon>
                    <div>No users found</div>
                  </div>
                </template>
              </v-data-table>
            </v-card>
          </div>

          <!-- ───── EVENTS TAB ───── -->
          <div v-if="tab === 2">
            <v-row>
              <v-col
                v-for="event in events"
                :key="event.id"
                cols="12"
                sm="6"
                lg="4"
              >
                <v-card rounded="xl" elevation="0" border height="100%">
                  <v-img
                    :src="event.image || 'https://via.placeholder.com/600x200'"
                    height="160"
                    cover
                  >
                    <template #error>
                      <div class="d-flex align-center justify-center fill-height bg-grey-lighten-2">
                        <v-icon size="40" color="grey">mdi-image-off</v-icon>
                      </div>
                    </template>
                  </v-img>

                  <v-card-item>
                    <v-card-title class="text-body-1 font-weight-semibold">
                      {{ event.title }}
                    </v-card-title>
                    <v-card-subtitle>
                      <v-icon size="14" class="mr-1">mdi-calendar</v-icon>
                      {{ event.date }}
                      <span v-if="event.time" class="ml-2">
                        <v-icon size="14" class="mr-1">mdi-clock</v-icon>{{ event.time }}
                      </span>
                    </v-card-subtitle>
                  </v-card-item>

                  <v-card-text class="pt-0">
                    <div class="d-flex gap-3 text-body-2 text-medium-emphasis">
                      <span>
                        <v-icon size="14" class="mr-1">mdi-map-marker</v-icon>
                        {{ event.location }}
                      </span>
                    </div>
                    <div class="d-flex gap-3 mt-1 text-body-2">
                      <span>
                        <v-icon size="14" class="mr-1" color="green">mdi-cash</v-icon>
                        ${{ event.price }}
                      </span>
                      <span>
                        <v-icon size="14" class="mr-1" color="orange">mdi-ticket</v-icon>
                        {{ event.available_tickets }} left
                      </span>
                    </div>
                  </v-card-text>

                  <v-card-actions class="px-4 pb-4 pt-0">
                    <v-btn
                      size="small"
                      variant="tonal"
                      color="blue-darken-1"
                      prepend-icon="mdi-pencil"
                      @click="editEvent(event)"
                    >
                      Edit
                    </v-btn>

                    <v-spacer />

                    <!-- Confirm Delete -->
                    <template v-if="confirmDeleteEventId === event.id">
                      <span class="text-caption text-error mr-2">Sure?</span>
                      <v-btn
                        size="small"
                        variant="flat"
                        color="error"
                        @click="deleteEvent(event.id)"
                      >
                        Yes
                      </v-btn>
                      <v-btn
                        size="small"
                        variant="text"
                        @click="cancelConfirmDeleteEvent"
                      >
                        Cancel
                      </v-btn>
                    </template>

                    <v-btn
                      v-else
                      size="small"
                      variant="text"
                      color="error"
                      icon="mdi-delete"
                      :loading="deletingEventId === event.id"
                      @click="askConfirmDeleteEvent(event.id)"
                    />
                  </v-card-actions>
                </v-card>
              </v-col>

              <v-col v-if="events.length === 0" cols="12">
                <div class="text-center pa-12 text-medium-emphasis">
                  <v-icon size="48" class="mb-3">mdi-calendar-blank</v-icon>
                  <div class="text-body-1">No events yet</div>
                  <v-btn
                    class="mt-4"
                    color="blue-darken-2"
                    variant="flat"
                    prepend-icon="mdi-plus"
                    @click="resetEventForm(); showAddEventDialog = true"
                  >
                    Create First Event
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </div>

          <!-- ───── BOOKINGS TAB ───── -->
          <div v-if="tab === 3">
            <v-card rounded="xl" elevation="0" border>
              <v-data-table
                :items="bookings"
                :headers="[
                  { title: 'ID', key: 'id', width: 80 },
                  { title: 'User', key: 'user_id' },
                  { title: 'Event', key: 'event_id' },
                  { title: 'Tickets', key: 'quantity', width: 100 },
                  { title: 'Total', key: 'total_price', width: 120 },
                  { title: 'Status', key: 'status', width: 130 },
                ]"
                item-value="id"
                hover
              >
                <template #item.total_price="{ item }">
                  ${{ item.total_price }}
                </template>

                <template #item.status="{ item }">
                  <v-chip
                    :color="item.status === 'confirmed' ? 'green' : item.status === 'cancelled' ? 'red' : 'orange'"
                    size="small"
                    variant="tonal"
                  >
                    {{ item.status ?? 'pending' }}
                  </v-chip>
                </template>

                <template #no-data>
                  <div class="text-center pa-8 text-medium-emphasis">
                    <v-icon size="40" class="mb-2">mdi-ticket-outline</v-icon>
                    <div>No bookings found</div>
                  </div>
                </template>
              </v-data-table>
            </v-card>
          </div>
        </template>
      </v-container>
    </v-main>

    <!-- ───── ADD EVENT DIALOG ───── -->
    <v-dialog v-model="showAddEventDialog" max-width="560" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-6 pb-4 text-h6 font-weight-semibold">
          <v-icon class="mr-2" color="blue-darken-2">mdi-calendar-plus</v-icon>
          New Event
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-6">
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="eventTitle"
                label="Title"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-format-title"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="eventDate"
                label="Date"
                type="date"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-calendar"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="eventTime"
                label="Time"
                type="time"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-clock"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="eventLocation"
                label="Location"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-map-marker"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="eventPrice"
                label="Price ($)"
                type="number"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-cash"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="eventAvailableTickets"
                label="Available Tickets"
                type="number"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-ticket"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="eventImage"
                label="Image URL (optional)"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-image"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="eventDescription"
                label="Description"
                variant="outlined"
                density="comfortable"
                rows="3"
                prepend-inner-icon="mdi-text"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-btn
            variant="text"
            @click="showAddEventDialog = false; resetEventForm()"
          >
            Cancel
          </v-btn>
          <v-spacer />
          <v-btn
            color="blue-darken-2"
            variant="flat"
            :disabled="!isEventFormValid"
            @click="addEvent"
          >
            Create Event
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ───── EDIT EVENT DIALOG ───── -->
    <v-dialog v-model="showEditEventDialog" max-width="560" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-6 pb-4 text-h6 font-weight-semibold">
          <v-icon class="mr-2" color="blue-darken-2">mdi-pencil</v-icon>
          Edit Event
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-6">
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="eventTitle"
                label="Title"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-format-title"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="eventDate"
                label="Date"
                type="date"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-calendar"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="eventTime"
                label="Time"
                type="time"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-clock"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="eventLocation"
                label="Location"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-map-marker"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="eventPrice"
                label="Price ($)"
                type="number"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-cash"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="eventAvailableTickets"
                label="Available Tickets"
                type="number"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-ticket"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="eventImage"
                label="Image URL (optional)"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-image"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="eventDescription"
                label="Description"
                variant="outlined"
                density="comfortable"
                rows="3"
                prepend-inner-icon="mdi-text"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-btn
            variant="text"
            @click="showEditEventDialog = false; resetEventForm()"
          >
            Cancel
          </v-btn>
          <v-spacer />
          <v-btn
            color="blue-darken-2"
            variant="flat"
            :disabled="!isEventFormValid"
            @click="updateEvent"
          >
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>