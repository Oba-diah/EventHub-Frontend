<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()

const event = ref(null)
const loading = ref(true)
const error = ref(null)
const booking = ref(null)
const bookingLoading = ref(false)
const ticketQuantity = ref(1)

const maxTickets = computed(() => parseInt(event.value?.available_tickets) || 10)

const unitPrice = computed(() => {
  if (!event.value?.price) return null
  const numeric = parseFloat(String(event.value.price).replace(/[^0-9.]/g, ''))
  return isNaN(numeric) ? null : numeric
})

const totalPrice = computed(() => {
  if (!unitPrice.value) return null
  return (unitPrice.value * ticketQuantity.value).toFixed(2)
})

const pricePrefix = computed(() => {
  if (!event.value?.price) return ''
  return String(event.value.price).replace(/[\d.,]+/, '').trim()
})

const decrementQty = () => {
  if (ticketQuantity.value > 1) ticketQuantity.value--
}

const incrementQty = () => {
  if (ticketQuantity.value < maxTickets.value) ticketQuantity.value++
}

onMounted(async () => {
  try {
    const id = route.params.id
    if (!id) { router.push('/events'); return }

    const response = await api.get(`events/${id}`)
    event.value = response.data.data || response.data

    if (!event.value) router.push('/events')
  } catch (err) {
    error.value = 'Failed to load event details'
    console.error(err)
  } finally {
    loading.value = false
  }
})

const goBack = () => router.push('/events')

const purchaseTickets = async () => {
  bookingLoading.value = true
  try {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    if (!token || !user.id) {
      alert('Please log in first')
      router.push('/login')
      return
    }

    const bookingData = {
      user_id: user.id,
      event_id: event.value.id,
      tickets_booked: ticketQuantity.value,
      event_title: event.value.title,
      event_date: event.value.date,
      event_location: event.value.location
    }

    const response = await api.post('/bookings', bookingData, {
      headers: { Authorization: `Bearer ${token}` }
    })

    booking.value = response.data
    alert(`✅ Booking successful! ${ticketQuantity.value} ticket(s) reserved.`)
  } catch (err) {
    console.error(err)
    alert('❌ Booking failed. Please try again.')
  } finally {
    bookingLoading.value = false
  }
}
</script>
<template>
  <!-- LOADING -->
  <v-container v-if="loading" class="text-center py-16">
    <v-progress-circular indeterminate size="70" width="6" color="primary" />
    <p class="mt-4 text-grey-darken-1 text-h6">
      Loading amazing event...
    </p>
  </v-container>

  <!-- ERROR -->
  <v-container v-else-if="error" class="text-center py-16">
    <v-icon size="70" color="error">mdi-alert-circle-outline</v-icon>

    <h2 class="mt-4">{{ error }}</h2>

    <v-btn class="mt-6" color="primary" rounded="xl" @click="goBack">
      Back To Events
    </v-btn>
  </v-container>

  <!-- EVENT PAGE -->
  <div v-else-if="event" class="event-wrapper">

    <v-container class="py-12">

      <v-row>

        <!-- LEFT: IMAGE -->
        <v-col cols="12" md="6">

          <v-img
            :src="event.image || 'party.jpg'"
            height="600"
            cover
            class="hero-img"
          >
            <div class="hero-overlay d-flex align-end pa-6">

              <div class="hero-content">

                <v-chip color="white" class="mb-3 text-primary font-weight-bold">
                  LIVE EVENT
                </v-chip>

                <h1 class="hero-title">
                  {{ event.title }}
                </h1>

                <div class="hero-meta mt-3">

                  <div class="meta-item">
                    <v-icon>mdi-calendar</v-icon>
                    <span>{{ event.date }}</span>
                  </div>

                  <div class="meta-item">
                    <v-icon>mdi-clock-outline</v-icon>
                    <span>{{ event.time || '6:00 PM' }}</span>
                  </div>

                  <div class="meta-item">
                    <v-icon>mdi-map-marker</v-icon>
                    <span>{{ event.location }}</span>
                  </div>

                </div>

              </div>

            </div>
          </v-img>

        </v-col>

        <!-- RIGHT: DETAILS + BOOKING -->
        <v-col cols="12" md="6">

          <!-- ABOUT -->
          <v-card rounded="xl" elevation="2" class="mb-6 pa-3">
            <v-card-title class="text-h5 font-weight-bold">
              About This Event
            </v-card-title>

            <v-card-text>
              {{ event.description || 'No description available.' }}
            </v-card-text>
          </v-card>

          <!-- AMENITIES -->
          <v-card
            v-if="event.amenities && event.amenities.length"
            rounded="xl"
            elevation="2"
            class="mb-6 pa-3"
          >
            <v-card-title class="text-h5 font-weight-bold">
              What's Included
            </v-card-title>

            <v-card-text>
              <div
                v-for="a in event.amenities"
                :key="a"
                class="amenity-item"
              >
                <v-icon color="success">mdi-check-circle</v-icon>
                <span>{{ a }}</span>
              </div>
            </v-card-text>
          </v-card>

          <!-- BOOKING -->
          <v-card rounded="xl" elevation="10" class="booking-card pa-3">

            <v-card-title class="text-h5 font-weight-bold">
              Book Tickets
            </v-card-title>

            <v-card-text>

              <div class="quick-info">

                <div class="info-row">
                  <span>Date</span>
                  <strong>{{ event.date }}</strong>
                </div>

                <div class="info-row">
                  <span>Location</span>
                  <strong>{{ event.location }}</strong>
                </div>

                <div class="info-row">
                  <span>Available</span>
                  <strong>{{ event.available_tickets || 'N/A' }}</strong>
                </div>

                <div class="info-row">
                  <span>Price</span>
                  <strong>{{ pricePrefix }} {{ event.price }}</strong>
                </div>

              </div>

              <v-divider class="my-5" />

              <!-- QUANTITY -->
              <div class="ticket-selector">

                <h3 class="selector-title">Select Quantity</h3>

                <div class="qty-box">

                  <v-btn
                    icon
                    variant="outlined"
                    :disabled="ticketQuantity <= 1 || !!booking"
                    @click="decrementQty"
                  >
                    <v-icon>mdi-minus</v-icon>
                  </v-btn>

                  <div class="qty-number">
                    {{ ticketQuantity }}
                  </div>

                  <v-btn
                    icon
                    variant="outlined"
                    :disabled="ticketQuantity >= maxTickets || !!booking"
                    @click="incrementQty"
                  >
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>

                </div>

                <div class="total-box">
                  <span>Total</span>
                  <h2>
                    {{ pricePrefix }} {{ ticketQuantity * (event.price || 0) }}
                  </h2>
                </div>

                <v-btn
                  block
                  size="large"
                  color="primary"
                  rounded="xl"
                  class="mt-4"
                  @click="purchaseTickets"
                  :loading="bookingLoading"
                  :disabled="!!booking"
                >
                  {{ booking
                    ? '✓ Booking Complete'
                    : 'Complete Purchase'
                  }}
                </v-btn>

              </div>

            </v-card-text>

          </v-card>

        </v-col>

      </v-row>

    </v-container>

  </div>

  <!-- FALLBACK -->
  <v-container v-else class="text-center py-16">
    <v-icon size="70">mdi-alert-circle-outline</v-icon>
    <h2 class="mt-4">Event not found</h2>

    <v-btn class="mt-6" color="primary" rounded="xl" @click="goBack">
      Back
    </v-btn>
  </v-container>
</template>

<style scoped>
.event-wrapper {
  min-height: 100vh;
}

/* IMAGE SIDE */
.hero-img {
  border-radius: 24px;
  overflow: hidden;
  position: relative;
}

.hero-overlay {
  background: linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.2));
  height: 100%;
  width: 100%;
  color: white;
}

.hero-content {
  max-width: 100%;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
  line-height: 1.2;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 10px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* RIGHT SIDE */
.quick-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
}

/* BOOKING */
.booking-card {
  position: sticky;
  top: 100px;
}

/* TICKET SELECTOR */
.ticket-selector {
  padding: 20px;
  border-radius: 18px;
  background: linear-gradient(135deg, #f5f7ff, #ffffff);
  border: 1px solid #e6e6e6;
  text-align: center;
}

.selector-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 14px;
}

.qty-box {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 18px;
}

.qty-number {
  font-size: 2rem;
  font-weight: 800;
  min-width: 60px;
}

.total-box {
  margin-top: 16px;
  padding: 14px;
  border-radius: 14px;
  background: white;
  border: 1px solid #eee;
}

.total-box h2 {
  margin-top: 6px;
  font-size: 1.5rem;
}

/* AMENITIES */
.amenity-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

/* MOBILE */
@media (max-width: 960px) {
  .hero-title {
    font-size: 2rem;
  }

  .booking-card {
    position: static;
  }
}
</style>