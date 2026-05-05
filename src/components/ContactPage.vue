<script setup>
const contactMethods = [
  {
    icon: 'mdi-phone',
    title: 'Call Us',
    detail: '+254 713 642 242',
  },
  {
    icon: 'mdi-email',
    title: 'Email',
    detail: 'eventhub@gmail.com',
  },
  {
    icon: 'mdi-map-marker',
    title: 'Visit',
    detail: '123 Event Lane, City Center',
  },
]
</script>

<template>
  <v-container fluid class="contact-hero pa-0">
    <v-row class="fill-height align-center justify-center text-center">
      <v-col cols="12" md="8">
        <div class="hero-copy">
          <h1>Reach out &amp; Make Your Event Unforgettable</h1>
          <p>Our team is here to help with planning, tickets, venues, and custom event experiences.</p>
          <v-btn color="primary" class="mt-6" to="/" elevation="2">Back to Home</v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>

  <v-container class="py-12">
    <v-row class="mb-10" align="stretch">
      <v-col cols="12" md="4" v-for="method in contactMethods" :key="method.title">
        <v-card class="pa-6 contact-card" elevation="4">
          <v-icon size="40" color="primary">{{ method.icon }}</v-icon>
          <h3 class="mt-4">{{ method.title }}</h3>
          <p class="body-1">{{ method.detail }}</p>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card elevation="4" class="pa-6">
          <h2>Send a Message</h2>
          <p>Have a question about an upcoming show or need help creating your own event? We’ll reply within one business day.</p>
          <v-form>
            <v-text-field label="Name" outlined dense class="mt-4" />
            <v-text-field label="Email" type="email" outlined dense />
            <v-text-field label="Subject" outlined dense />
            <v-textarea label="Message" rows="5" outlined dense />
            <v-btn color="primary" class="mt-4" elevation="2">Send Message</v-btn>
          </v-form>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card elevation="4" class="pa-0 contact-map-card">
          <v-img
            src="https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80"
            height="100%"
            class="contact-map"
          >
            <template #placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular indeterminate color="primary" />
              </v-row>
            </template>
          </v-img>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.contact-hero {
  min-height: 420px;
  background: linear-gradient(rgba(21, 101, 192, 0.65), rgba(0, 0, 0, 0.35)), url('https://images.unsplash.com/photo-1515169067861-5d299b4a5e78?auto=format&fit=crop&w=1400&q=80');
  background-size: cover;
  background-position: center;
  color: white;
}
.hero-copy {
  backdrop-filter: blur(4px);
  padding: 48px 24px;
  border-radius: 24px;
  background: rgba(0, 0, 0, 0.36);
}
.hero-copy h1 {
  font-size: clamp(2.2rem, 4vw, 3.8rem);
  margin-bottom: 16px;
}
.contact-card {
  min-height: 220px;
}
.contact-card h3 {
  margin-top: 16px;
}
.contact-map-card {
  min-height: 460px;
}
.contact-map {
  object-fit: cover;
}
</style>
