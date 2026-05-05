<script setup>
const wrapperStyle = {
  minHeight: '100vh',
  padding: '20px',
  background: 'linear-gradient(135deg, #667eea, #764ba2)'
}

const centerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh'
}

const cardStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '10px',
  marginBottom: '20px'
}

const headerGrid = {
  display: 'grid',
  gridTemplateColumns: 'auto 1fr auto',
  gap: '20px',
  alignItems: 'center'
}

const avatarStyle = {
  width: '100px',
  height: '100px',
  borderRadius: '50%',
  background: '#667eea',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '24px'
}

const bookingCard = {
  border: '1px solid #ddd',
  padding: '10px',
  marginBottom: '10px',
  borderRadius: '6px'
}

const btnPrimary = {
  background: '#667eea',
  color: 'white',
  padding: '10px',
  border: 'none',
  cursor: 'pointer'
}

const btnSuccess = {
  background: 'green',
  color: 'white',
  padding: '10px',
  border: 'none'
}

const btnSecondary = {
  background: 'gray',
  color: 'white',
  padding: '10px',
  border: 'none'
}

const btnDanger = {
  background: 'red',
  color: 'white',
  padding: '10px',
  border: 'none'
}

const alertSuccess = {
  background: '#d4edda',
  padding: '10px',
  marginBottom: '10px'
}

const alertError = {
  background: '#f8d7da',
  padding: '10px',
  marginBottom: '10px'
}
</script>

<template>
<template>
  <div :style="wrapperStyle">
    
    <!-- Not Authenticated -->
    <div v-if="!user" :style="centerStyle">
      <div :style="cardStyle">
        <h2>Please Log In</h2>
        <p>You need to be logged in to view your profile.</p>
        <router-link to="/login" :style="btnPrimary">Go to Login</router-link>
      </div>
    </div>

    <!-- Profile -->
    <div v-else :style="{ maxWidth: '1200px', margin: '0 auto' }">

      <!-- Alerts -->
      <div v-if="success" :style="alertSuccess">{{ success }}</div>
      <div v-if="error" :style="alertError">{{ error }}</div>

      <!-- Header -->
      <div :style="cardStyle">
        <div :style="headerGrid">

          <!-- Avatar -->
          <div style="text-align:center">
            <div :style="avatarStyle">
              <img v-if="profilePhoto" :src="profilePhoto" style="width:100%;height:100%;object-fit:cover" />
              <span v-else>{{ userInitials }}</span>
            </div>

            <input v-if="isEditing" type="file" @change="handlePhotoUpload" />
          </div>

          <!-- Info -->
          <div>
            <h2>{{ user.name }}</h2>
            <p>{{ user.email }}</p>

            <div style="display:flex; gap:20px;">
              <div>
                <strong>{{ upcomingEventsCount }}</strong>
                <p>Upcoming</p>
              </div>
              <div>
                <strong>{{ pastEventsCount }}</strong>
                <p>Past</p>
              </div>
              <div>
                <strong>{{ savedEvents.length }}</strong>
                <p>Saved</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div>
            <button v-if="!isEditing" :style="btnPrimary" @click="isEditing = true">
              Edit
            </button>

            <button v-else :style="btnSuccess" @click="updateProfile">
              Save
            </button>

            <button v-if="isEditing" :style="btnSecondary" @click="isEditing = false">
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div :style="cardStyle">
        <button @click="activeTab='overview'">Overview</button>
        <button @click="activeTab='bookings'">Bookings</button>
        <button @click="activeTab='saved'">Saved</button>
        <button @click="activeTab='security'">Security</button>
      </div>

      <!-- CONTENT -->
      <div :style="cardStyle">

        <!-- Overview -->
        <div v-if="activeTab==='overview'">

          <div v-if="!isEditing">
            <p><strong>Name:</strong> {{ user.name }}</p>
            <p><strong>Email:</strong> {{ user.email }}</p>
            <p><strong>Phone:</strong> {{ user.phone }}</p>
          </div>

          <div v-else>
            <input v-model="editForm.name" placeholder="Name" />
            <input v-model="editForm.phone" placeholder="Phone" />
            <textarea v-model="editForm.bio" placeholder="Bio"></textarea>
          </div>
        </div>

        <!-- Bookings -->
        <div v-if="activeTab==='bookings'">
          <p v-if="loading">Loading...</p>

          <div v-else-if="bookings.length === 0">
            No bookings yet
          </div>

          <div v-else>
            <div v-for="b in bookings" :key="b.id" :style="bookingCard">
              <h4>{{ b.event_title }}</h4>
              <p>{{ formatDate(b.event_date) }}</p>
              <p>{{ b.location }}</p>
            </div>
          </div>
        </div>

        <!-- Saved -->
        <div v-if="activeTab==='saved'">
          <div v-if="savedEvents.length === 0">No saved events</div>

          <div v-else>
            <div v-for="e in savedEvents" :key="e.id" :style="bookingCard">
              <h4>{{ e.title }}</h4>
              <p>{{ formatDate(e.date) }}</p>
            </div>
          </div>
        </div>

        <!-- Security -->
        <div v-if="activeTab==='security'">

          <button :style="btnPrimary" @click="isChangingPassword=true">
            Change Password
          </button>

          <div v-if="isChangingPassword">
            <input type="password" v-model="passwordForm.currentPassword" placeholder="Current" />
            <input type="password" v-model="passwordForm.newPassword" placeholder="New" />
            <input type="password" v-model="passwordForm.confirmPassword" placeholder="Confirm" />

            <button :style="btnSuccess" @click="changePassword">
              Update
            </button>
          </div>

          <button :style="btnDanger" @click="handleLogout">
            Logout
          </button>
        </div>

      </div>
    </div>
  </div>
</template>
</template>


