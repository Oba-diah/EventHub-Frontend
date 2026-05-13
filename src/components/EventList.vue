<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

const events = ref([])
const loading = ref(true)
const error = ref(null)

/**
 * Normalize event object so ALL events always have a consistent structure
 * This prevents undefined IDs and backend inconsistencies
 */
const normalizeEvent = (event) => {
  return {
    ...event,
    id: event.id || event.event_id || null
  }
}

/**
 * Safe navigation to event details
 * Never allows undefined IDs to break routing
 */
const viewEventDetails = (event) => {
  const normalized = normalizeEvent(event)

  if (!normalized.id) {
    console.error('❌ Event missing ID:', event)
    return
  }

  router.push({
    name: 'EventDetails',
    params: { id: normalized.id }
  })
}

/**
 * Fetch events from backend
 */
onMounted(async () => {
  try {
    const response = await api.get('events')

    const rawEvents = Array.isArray(response.data)
      ? response.data
      : response.data.data || response.data.events || []

    events.value = rawEvents.map(normalizeEvent)

  } catch (err) {
    error.value = 'Failed to load events'
    console.error(err)
  } finally {
    loading.value = false
  }
})
const s = {
  container: { paddingTop: '2rem', paddingBottom: '2rem' },
  headerRow: { marginBottom: '1.5rem' },
  h1: { fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: 700, marginBottom: '0.5rem' },
  p: { fontSize: '1rem', lineHeight: '1.5rem', color: 'rgba(0,0,0,0.6)' },
  loadingRow: { paddingTop: '3rem', paddingBottom: '3rem' },
  centerCol: { textAlign: 'center' },
  mt4: { marginTop: '1rem' },
  errorRow: { paddingTop: '3rem', paddingBottom: '3rem' },
  mb4: { marginBottom: '1rem' },
  h3: { fontSize: '1.5rem', lineHeight: '2rem', fontWeight: 700, marginBottom: '0.5rem' },
  eventCard: {},
  cardText: { padding: '1rem' },
  cardH3: { fontSize: '1.25rem', lineHeight: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' },
  flexDiv: { display: 'flex', alignItems: 'center' },
  me1: { marginRight: '0.25rem' },
  mt1: { marginTop: '0.25rem' },
  cardActions: { padding: '1rem', paddingTop: '0' },
}

const mx = (...objs) => Object.assign({}, ...objs)

</script>

<template>
  <v-container :style="{ paddingTop: '2rem', paddingBottom: '2rem' }">

    <!-- HEADER -->
    <v-row :style="{ marginBottom: '1.5rem' }">
      <v-col cols="12">
        <h1 :style="{ fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: 700, marginBottom: '0.5rem' }">Upcoming Events</h1>
        <p :style="{ fontSize: '1rem', lineHeight: '1.5rem', color: 'rgba(0,0,0,0.6)' }">
          Discover amazing events happening in your city
        </p>
      </v-col>
    </v-row>

    <!-- LOADING -->
    <v-row v-if="loading" justify="center" :style="{ paddingTop: '3rem', paddingBottom: '3rem' }">
      <v-col cols="12" :style="{ textAlign: 'center' }">
        <v-progress-circular indeterminate color="primary" size="64" />
        <p :style="{ marginTop: '1rem' }">Loading events...</p>
      </v-col>
    </v-row>

    <!-- ERROR -->
    <v-row v-else-if="error" justify="center" :style="{ paddingTop: '3rem', paddingBottom: '3rem' }">
      <v-col cols="12" :style="{ textAlign: 'center' }">
        <v-icon size="64" color="error" :style="{ marginBottom: '1rem' }">mdi-alert-circle</v-icon>
        <h3 :style="{ fontSize: '1.5rem', lineHeight: '2rem', fontWeight: 700, marginBottom: '0.5rem' }">Error loading events</h3>
        <p :style="{ fontSize: '1rem', lineHeight: '1.5rem', color: 'rgba(0,0,0,0.6)' }">{{ error }}</p>
      </v-col>
    </v-row>

    <!-- EVENTS -->
    <v-row v-else>
      <v-col cols="12" md="4" v-for="event in events" :key="event.id">

        <v-card
          :style="{}"
          elevation="3"
          @click="viewEventDetails(event)"
        >

          <v-img
            :src="event.image"
            height="200px"
          />

          <v-card-text :style="{ padding: '1rem' }">
            <h3 :style="{ fontSize: '1.25rem', lineHeight: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }">
              {{ event.title }}
            </h3>

            <div :style="{ display: 'flex', alignItems: 'center' }">
              <v-icon size="16" :style="{ marginRight: '0.25rem' }">mdi-calendar</v-icon>
              <span>{{ event.date }} at {{ event.time }}</span>
            </div>

            <div :style="{ display: 'flex', alignItems: 'center', marginTop: '0.25rem' }">
              <v-icon size="16" :style="{ marginRight: '0.25rem' }">mdi-map-marker</v-icon>
              <span>{{ event.location }}</span>
            </div>

            <div class="d-flex align-center mt-1">
              <v-icon size="16" class="me-1">mdi-ticket-confirmation</v-icon>
              <span>{{ event.available_tickets ?? 'N/A' }} tickets left</span>
            </div>
          </v-card-text>

          <v-card-actions class="pa-4 pt-0">

            <v-chip
              :color="event.price === 0 || event.price === 'Free' ? 'success' : 'primary'"
              size="small"
            >
              {{ event.price === 0 ? 'Free' : `KSH ${event.price}` }}
            </v-chip>

            <v-spacer />

            <v-btn
              color="primary"
              variant="text"
              size="small"
              @click.stop="viewEventDetails(event)"
            >
              View Details
            </v-btn>

          </v-card-actions>

        </v-card>

      </v-col>
    </v-row>

    <v-row v-if="!loading && !error && events.length === 0" class="text-center py-12">
      <v-col cols="12">
        <v-icon size="64" color="grey-lighten-1">mdi-calendar-blank</v-icon>
        <h3 class="text-h5 mb-2">No events found</h3>
        <p class="text-body-1 text-medium-emphasis">
          Check back later for upcoming events
        </p>
      </v-col>
    </v-row>

  </v-container>
</template>

<style scoped>
.event-card {
  cursor: pointer;
  transition: 0.2s ease;
}

.event-card:hover {
  transform: translateY(-4px);
}
</style>