<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()

const event = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const response = await api.get(`events/${route.params.id}`)
    event.value = response.data

    if (!event.value) {
      router.push('/events')
    }
  } catch (err) {
    error.value = 'Failed to load event details'
    console.error(err)
  } finally {
    loading.value = false
  }
})

const goBack = () => {
  router.push('/events')
}

const purchaseTickets = () => {
  alert('Ticket purchase coming soon')
}
</script>

<template>
  <v-container v-if="loading" class="text-center py-12">
    <v-progress-circular indeterminate size="64" />
    <p>Loading event...</p>
  </v-container>

  <v-container v-else-if="error" class="text-center py-12">
    <v-icon size="64" color="error">mdi-alert</v-icon>
    <p>{{ error }}</p>
    <v-btn @click="goBack">Back</v-btn>
  </v-container>

  <div v-else-if="event">
    <v-container fluid class="pa-6" style="background:#1976d2; color:white;">
      <v-row align="center">
        <v-col md="6">
          <h1>{{ event.title }}</h1>

          <p>{{ event.date }} {{ event.time || '' }}</p>
          <p>{{ event.location }}</p>
          <p>{{ event.price }}</p>

          <v-btn color="white" @click="purchaseTickets">
            Get Tickets
          </v-btn>

          <v-btn variant="outlined" @click="goBack">
            Back
          </v-btn>
        </v-col>

        <v-col md="6">
          <v-img
            :src="event.image || 'https://via.placeholder.com/400'"
            height="300"
            cover
          />
        </v-col>
      </v-row>
    </v-container>

    <v-container class="py-6">
      <v-row>
        <v-col md="8">
          <v-card class="mb-4">
            <v-card-title>About</v-card-title>
            <v-card-text>
              {{ event.description || 'No description available.' }}
            </v-card-text>
          </v-card>

          <v-card v-if="event.amenities && event.amenities.length">
            <v-card-title>What's Included</v-card-title>
            <v-card-text>
              <div v-for="a in event.amenities" :key="a">
                {{ a }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col md="4">
          <v-card>
            <v-card-title>Quick Info</v-card-title>

            <v-card-text>
              <p><strong>Date:</strong> {{ event.date }}</p>
              <p><strong>Location:</strong> {{ event.location }}</p>
              <p><strong>Tickets:</strong> {{ event.available_tickets || 'N/A' }}</p>
              <p><strong>Price:</strong> {{ event.price }}</p>

              <v-btn block color="primary" class="mt-4" @click="purchaseTickets">
                Buy Ticket
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>

  <v-container v-else class="text-center py-12">
    <v-icon size="64">mdi-alert</v-icon>
    <p>Event not found</p>
    <v-btn @click="goBack">Back</v-btn>
  </v-container>
</template>