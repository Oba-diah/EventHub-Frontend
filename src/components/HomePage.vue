<script setup>
import { ref } from 'vue'


const s = {
  hero: {
    minHeight: '560px',
    background: `linear-gradient(180deg, rgba(2,0,36,0.75) 0%, rgba(12,95,170,0.70) 45%, rgba(255,255,255,0.15) 100%),
      url('https://images.unsplash.com/photo-1497032205916-ac775f0649ae?auto=format&fit=crop&w=1600&q=80')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: 'white',
  },
  heroCopy: {
    maxWidth: '640px',
    padding: '64px 32px',
  },
  eyebrow: {
    display: 'inline-block',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: '#a6d5ff',
    fontWeight: 600,
    marginBottom: '18px',
  },
  h1: {
    fontSize: 'clamp(2.5rem, 4vw, 4.2rem)',
    lineHeight: 1.03,
    marginBottom: '24px',
  },
  heroParagraph: {
    maxWidth: '540px',
    marginBottom: '32px',
    color: 'rgba(255,255,255,0.9)',
    fontSize: '1.05rem',
  },
  sectionHeaderH2: {
    fontSize: '2rem',
    marginBottom: '8px',
  },
  sectionHeaderP: {
    color: 'rgba(0,0,0,0.65)',
  },
  featureCard: {
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
    cursor: 'pointer',
  },
  featureCardTitle: {
    marginTop: '16px',
  },
  eventMeta: {
    fontSize: '0.85rem',
    color: 'rgba(0,0,0,0.65)',
    textTransform: 'uppercase',
  },
  statBox: {
    background: '#f7fbff',
    textAlign: 'center',
    borderRadius: '20px',
    padding: '32px 24px',
  },
  statH3: {
    fontSize: '2.4rem',
    marginBottom: '8px',
  },
  ctaCopy: {
    display: 'grid',
    gap: '20px',
  },
}

const featuredEvents = [
  {
    title: 'Summer Music Festival',
    date: 'July 20, 2026',
    location: 'Riverfront Park',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Design & Innovation Expo',
    date: 'August 12, 2026',
    location: 'Downtown Convention Center',
    image: 'https://images.unsplash.com/photo-1515169067865-5387ec356754?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Community Food Market',
    date: 'September 5, 2026',
    location: 'City Hall Plaza',
    image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=800&q=80',
  },
]

const onCardMouseenter = (e) => { e.currentTarget.style.transform = 'translateY(-6px)' }
const onCardMouseleave = (e) => { e.currentTarget.style.transform = 'translateY(0)' }
</script>

<template>
  <v-container fluid class="pa-0" :style="s.hero">
    <v-row class="fill-height align-center">
      <v-col cols="12" md="7" :style="s.heroCopy">
        <div>
          <span :style="s.eyebrow">Live events made simple</span>
          <h1 :style="s.h1">Discover experiences that move your world.</h1>
          <p :style="s.heroParagraph">EventHub brings the best concerts, festivals, workshops, and curated nights together in one place.</p>
          <v-btn color="primary" large to="/events">Browse Events</v-btn>
          <v-btn variant="tonal" large class="ms-4" to="/contact">Contact Us</v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>

  <v-container class="py-12">
    <v-row class="text-center mb-10">
      <v-col cols="12" md="4">
        <v-icon size="44" color="primary">mdi-calendar-check</v-icon>
        <h3 class="mt-4">Handpicked Events</h3>
        <p>Find the best upcoming shows, conferences, and community gatherings near you.</p>
      </v-col>
      <v-col cols="12" md="4">
        <v-icon size="44" color="primary">mdi-ticket-confirmation</v-icon>
        <h3 class="mt-4">Seamless Booking</h3>
        <p>Reserve tickets in seconds with easy checkout and secure payment options.</p>
      </v-col>
      <v-col cols="12" md="4">
        <v-icon size="44" color="primary">mdi-star-circle</v-icon>
        <h3 class="mt-4">Event Support</h3>
        <p>Get expert assistance for every step, from planning to managing your guest list.</p>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12" md="4"
        v-for="event in featuredEvents" :key="event.title"
      >
        <v-card
          elevation="3"
          :style="s.featureCard"
          @mouseenter="onCardMouseenter"
          @mouseleave="onCardMouseleave"
        >
          <v-img :src="event.image" height="240px" />
          <v-card-text>
            <h3 :style="s.featureCardTitle">{{ event.title }}</h3>
            <p :style="s.eventMeta">{{ event.date }} · {{ event.location }}</p>
          </v-card-text>
          <v-card-actions>
            <v-btn text to="/eventdetails">View details</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-12" align="center" justify="space-around" style="gap: 1rem">
      <v-col cols="12" md="3" :style="s.statBox">
        <h3 :style="s.statH3">5,200+</h3>
        <p>Tickets booked</p>
      </v-col>
      <v-col cols="12" md="3" :style="s.statBox">
        <h3 :style="s.statH3">120+</h3>
        <p>Live events</p>
      </v-col>
      <v-col cols="12" md="3" :style="s.statBox">
        <h3 :style="s.statH3">98%</h3>
        <p>Customer satisfaction</p>
      </v-col>
    </v-row>

    <v-row class="mt-12" align="center">
      <v-col cols="12" md="8">
        <v-sheet class="pa-10" elevation="2">
          <div :style="s.ctaCopy">
            <h2>Ready to plan your next event?</h2>
            <p>Whether you're attending or organizing, EventHub has the tools and support you need to make it a success.</p>
            <v-btn color="primary" large to="/contact">Get in touch</v-btn>
          </div>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>