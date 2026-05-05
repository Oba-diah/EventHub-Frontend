<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../services/auth'

const router = useRouter()
const { logout } = useAuth()
const isLoggedIn = ref(false)
const isAdmin = ref(false)

onMounted(() => {
  const authToken = localStorage.getItem('authToken')
  const adminStatus = localStorage.getItem('isAdmin')
  
  isLoggedIn.value = !!authToken
  isAdmin.value = adminStatus === 'true' || adminStatus === true
})

const logoutAndReturn = () => {
  logout()
  isLoggedIn.value = false
  isAdmin.value = false
  router.push('/')
}
</script>

<template>
  <v-app-bar color="#29C0F7" dark>
    <v-app-bar-title>
      <router-link to="/" class="nav-title">EventHub</router-link>
    </v-app-bar-title>

    <v-spacer />
    <v-btn text to="/">Home</v-btn>
    <v-btn text to="/events">Events</v-btn>
    <v-btn text to="/contact">Contact</v-btn>
    <v-btn text to="/profile" v-if="isLoggedIn">Profile</v-btn>
    <v-btn text to="/admin" v-if="isAdmin && isLoggedIn">Admin</v-btn>

    <v-spacer />

    <!-- Authenticated User Menu -->
    <v-btn icon="mdi-account" v-if="isLoggedIn">
      <v-menu activator="parent">
        <v-list>
          <v-list-item>
            <v-btn color="primary" to="/profile">Profile</v-btn>
          </v-list-item>
          <v-list-item>
            <v-btn color="primary" @click="logoutAndReturn">Logout</v-btn>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-btn>

    <!-- Non-Authenticated User Buttons -->
    <div v-else class="auth-buttons">
      <v-btn text to="/login" class="login-btn">Login</v-btn>
      <v-btn to="/signup" class="signup-btn">Sign Up</v-btn>
    </div>
  </v-app-bar>
</template>

<style scoped>
.nav-title {
  color: white;
  text-decoration: none;
  font-weight: 700;
}

.auth-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.login-btn {
  color: white;
}

.signup-btn {
  background-color: white;
  color: #29C0F7;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.signup-btn:hover {
  background-color: #f0f0f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style>