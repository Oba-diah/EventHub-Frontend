<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

const events = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const response = await api.get('events')
    events.value = response.data
  } catch (err) {
    error.value = 'Failed to load events'
    console.error(err)
  } finally {
    loading.value = false
  }
})

const viewEventDetails = (eventId) => {
  router.push({ name: 'EventDetails', params: { id: eventId } })
}
</script>

<template>
  <v-container class="py-8">
    <v-row class="mb-6">
      <v-col cols="12">
        <h1 class="text-h3 font-weight-bold mb-2">Upcoming Events</h1>
        <p class="text-body-1 text-medium-emphasis">Discover amazing events happening in your city</p>
      </v-col>
    </v-row>

    <v-row v-if="loading" justify="center" class="py-12">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64" />
        <p class="mt-4">Loading events...</p>
      </v-col>
    </v-row>

    <v-row v-else-if="error" justify="center" class="py-12">
      <v-col cols="12" class="text-center">
        <v-icon size="64" color="error" class="mb-4">mdi-alert-circle</v-icon>
        <h3 class="text-h5 mb-2">Error loading events</h3>
        <p class="text-body-1 text-medium-emphasis">{{ error }}</p>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col cols="12" md="4" v-for="event in events" :key="event.id">
        <v-card
          class="event-card"
          elevation="3"
          @click="viewEventDetails(event.id)"
        >
          <v-img
            :src="event.image"
            height="200px"
            class="event-image"
          >
            <template #placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular indeterminate color="primary" />
              </v-row>
            </template>
          </v-img>

          <v-card-text class="pa-4">
            <div class="event-category text-caption text-uppercase font-weight-medium mb-2">
              {{ event.category }}
            </div>
            <h3 class="event-title text-h6 font-weight-bold mb-2">
              {{ event.title }}
            </h3>
            <div class="event-details">
              <v-icon size="16" class="me-1">mdi-calendar</v-icon>
              <span class="text-body-2">{{ event.date }} at {{ event.time }}</span>
            </div>
            <div class="event-details mt-1">
              <v-icon size="16" class="me-1">mdi-map-marker</v-icon>
              <span class="text-body-2">{{ event.location }}</span>
            </div>
          </v-card-text>

          <v-card-actions class="pa-4 pt-0">
            <v-chip
              :color="event.price === 'Free' ? 'success' : 'primary'"
              variant="flat"
              size="small"
              class="me-2"
            >
              {{ event.price }}
            </v-chip>
            <v-spacer />
            <v-btn
              color="primary"
              variant="text"
              size="small"
              @click.stop="viewEventDetails(event.id)"
            >
              View Details
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="!loading && !error && events.length === 0" class="text-center py-12">
      <v-col cols="12">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-calendar-blank</v-icon>
        <h3 class="text-h5 mb-2">No events found</h3>
        <p class="text-body-1 text-medium-emphasis">Check back later for upcoming events</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.event-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.event-image {
  object-fit: cover;
}

.event-category {
  color: #1976d2;
}

.event-title {
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-details {
  display: flex;
  align-items: center;
  color: rgba(0, 0, 0, 0.6);
}
</style>