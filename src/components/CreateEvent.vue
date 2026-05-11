<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

// User info (set by admin check in parent)
const user = ref(null)

// Form data
const formData = ref({
  title: '',
  description: '',
  date: '',
  time: '',
  location: '',
  category: 'entertainment',
  capacity: '',
  image: null,
  imagePreview: null,
  ticketPrice: '',
  organizer: ''
})

// Form state
const loading = ref(false)
const error = ref(null)
const success = ref(false)
const successMessage = ref('')

// Form validation state
const formErrors = ref({})

// Categories
const categories = [
  'entertainment',
  'sports',
  'technology',
  'business',
  'education',
  'health',
  'music',
  'art',
  'food',
  'other'
]

// Initialize component
onMounted(() => {
  const userData = localStorage.getItem('user')
  
  if (userData) {
    user.value = JSON.parse(userData)
    formData.value.organizer = user.value.name || user.value.email
  }
})

// Validate form
const validateForm = () => {
  formErrors.value = {}
  let isValid = true

  if (!formData.value.title.trim()) {
    formErrors.value.title = 'Event title is required'
    isValid = false
  } else if (formData.value.title.length < 3) {
    formErrors.value.title = 'Title must be at least 3 characters'
    isValid = false
  }

  if (!formData.value.description.trim()) {
    formErrors.value.description = 'Description is required'
    isValid = false
  } else if (formData.value.description.length < 10) {
    formErrors.value.description = 'Description must be at least 10 characters'
    isValid = false
  }

  if (!formData.value.date) {
    formErrors.value.date = 'Event date is required'
    isValid = false
  }

  if (!formData.value.time) {
    formErrors.value.time = 'Event time is required'
    isValid = false
  }

  if (!formData.value.location.trim()) {
    formErrors.value.location = 'Location is required'
    isValid = false
  }

  if (!formData.value.capacity || formData.value.capacity <= 0) {
    formErrors.value.capacity = 'Capacity must be greater than 0'
    isValid = false
  }

  if (!formData.value.ticketPrice || formData.value.ticketPrice < 0) {
    formErrors.value.ticketPrice = 'Ticket price cannot be negative'
    isValid = false
  }

  return isValid
}

// Handle image selection
const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      formErrors.value.image = 'Image size must be less than 5MB'
      return
    }

    if (!file.type.startsWith('image/')) {
      formErrors.value.image = 'Please select a valid image file'
      return
    }

    formData.value.image = file
    formErrors.value.image = null

    const reader = new FileReader()
    reader.onload = (e) => {
      formData.value.imagePreview = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// Clear image
const clearImage = () => {
  formData.value.image = null
  formData.value.imagePreview = null
}

// Submit form
const submitForm = async () => {
  if (!validateForm()) {
    error.value = 'Please fix the errors in the form'
    return
  }

  loading.value = true
  error.value = null
  success.value = false

  try {
    const formPayload = new FormData()
    
    // Add all form fields
    formPayload.append('title', formData.value.title)
    formPayload.append('description', formData.value.description)
    formPayload.append('date', formData.value.date)
    formPayload.append('time', formData.value.time)
    formPayload.append('location', formData.value.location)
    formPayload.append('price', formData.value.ticketPrice)
    formPayload.append('available_tickets', formData.value.capacity)

    // Add image if selected
    if (formData.value.image) {
      formPayload.append('image', formData.value.image)
    }

    // Send to backend
    const response = await api.post('events', formPayload, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    success.value = true
    successMessage.value = 'Event created successfully!'

    // Reset form after 2 seconds
    setTimeout(() => {
      resetForm()
    }, 2000)

  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Failed to create event'
    console.error('Create event error:', err)
  } finally {
    loading.value = false
  }
}

// Reset form
const resetForm = () => {
  formData.value = {
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'entertainment',
    capacity: '',
    image: null,
    imagePreview: null,
    ticketPrice: '',
    organizer: user.value?.name || user.value?.email || ''
  }
  formErrors.value = {}
  success.value = false
}

// Get minimum date (today)
const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})
</script>

<template>
  <div class="create-event-container">
    <!-- Main Form -->
    <div class="create-event-form">
      <h2 class="form-title">Create New Event</h2>

      <!-- Success Alert -->
      <div v-if="success" class="alert alert-success" role="alert">
        {{ successMessage }}
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>

      <form @submit.prevent="submitForm">
        <!-- Basic Information Section -->
        <div class="form-section">
          <h3 class="section-title">Basic Information</h3>

          <!-- Event Title -->
          <div class="form-group">
            <label for="title" class="form-label">Event Title <span class="required">*</span></label>
            <input
              id="title"
              v-model="formData.title"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': formErrors.title }"
              placeholder="Enter event title"
              maxlength="100"
            />
            <div v-if="formErrors.title" class="invalid-feedback">
              {{ formErrors.title }}
            </div>
          </div>

          <!-- Description -->
          <div class="form-group">
            <label for="description" class="form-label">Description <span class="required">*</span></label>
            <textarea
              id="description"
              v-model="formData.description"
              class="form-control"
              :class="{ 'is-invalid': formErrors.description }"
              placeholder="Enter event description"
              rows="4"
              maxlength="500"
            ></textarea>
            <small class="form-text text-muted">{{ formData.description.length }}/500 characters</small>
            <div v-if="formErrors.description" class="invalid-feedback">
              {{ formErrors.description }}
            </div>
          </div>

          <!-- Category -->
          <div class="form-group">
            <label for="category" class="form-label">Category <span class="required">*</span></label>
            <select id="category" v-model="formData.category" class="form-control">
              <option v-for="cat in categories" :key="cat" :value="cat">
                {{ cat.charAt(0).toUpperCase() + cat.slice(1) }}
              </option>
            </select>
          </div>
        </div>

        <!-- Date & Time Section -->
        <div class="form-section">
          <h3 class="section-title">Date & Time</h3>

          <div class="row">
            <!-- Date -->
            <div class="col-md-6">
              <div class="form-group">
                <label for="date" class="form-label">Event Date <span class="required">*</span></label>
                <input
                  id="date"
                  v-model="formData.date"
                  type="date"
                  class="form-control"
                  :class="{ 'is-invalid': formErrors.date }"
                  :min="minDate"
                />
                <div v-if="formErrors.date" class="invalid-feedback">
                  {{ formErrors.date }}
                </div>
              </div>
            </div>

            <!-- Time -->
            <div class="col-md-6">
              <div class="form-group">
                <label for="time" class="form-label">Event Time <span class="required">*</span></label>
                <input
                  id="time"
                  v-model="formData.time"
                  type="time"
                  class="form-control"
                  :class="{ 'is-invalid': formErrors.time }"
                />
                <div v-if="formErrors.time" class="invalid-feedback">
                  {{ formErrors.time }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Location & Capacity Section -->
        <div class="form-section">
          <h3 class="section-title">Location & Capacity</h3>

          <!-- Location -->
          <div class="form-group">
            <label for="location" class="form-label">Location <span class="required">*</span></label>
            <input
              id="location"
              v-model="formData.location"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': formErrors.location }"
              placeholder="Enter event location"
            />
            <div v-if="formErrors.location" class="invalid-feedback">
              {{ formErrors.location }}
            </div>
          </div>

          <!-- Capacity -->
          <div class="form-group">
            <label for="capacity" class="form-label">Capacity <span class="required">*</span></label>
            <input
              id="capacity"
              v-model.number="formData.capacity"
              type="number"
              class="form-control"
              :class="{ 'is-invalid': formErrors.capacity }"
              placeholder="Maximum number of attendees"
              min="1"
            />
            <div v-if="formErrors.capacity" class="invalid-feedback">
              {{ formErrors.capacity }}
            </div>
          </div>
        </div>

        <!-- Pricing Section -->
        <div class="form-section">
          <h3 class="section-title">Pricing</h3>

          <div class="form-group">
            <label for="ticketPrice" class="form-label">Ticket Price (€) <span class="required">*</span></label>
            <input
              id="ticketPrice"
              v-model.number="formData.ticketPrice"
              type="number"
              class="form-control"
              :class="{ 'is-invalid': formErrors.ticketPrice }"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
            <small class="form-text text-muted">Set to 0 for free events</small>
            <div v-if="formErrors.ticketPrice" class="invalid-feedback">
              {{ formErrors.ticketPrice }}
            </div>
          </div>
        </div>

        <!-- Image Section -->
        <div class="form-section">
          <h3 class="section-title">Event Image</h3>

          <div class="form-group">
            <label for="image" class="form-label">Event Image (Optional)</label>
            <input
              id="image"
              type="file"
              class="form-control"
              :class="{ 'is-invalid': formErrors.image }"
              accept="image/*"
              @change="handleImageUpload"
            />
            <small class="form-text text-muted">Max file size: 5MB. Supported formats: JPG, PNG, GIF</small>
            <div v-if="formErrors.image" class="invalid-feedback">
              {{ formErrors.image }}
            </div>

            <!-- Image Preview -->
            <div v-if="formData.imagePreview" class="image-preview mt-3">
              <img :src="formData.imagePreview" alt="Preview" class="preview-img" />
              <button type="button" class="btn btn-sm btn-danger mt-2" @click="clearImage">
                Remove Image
              </button>
            </div>
          </div>
        </div>

        <!-- Organizer Information -->
        <div class="form-section">
          <h3 class="section-title">Organizer Information</h3>

          <div class="form-group">
            <label for="organizer" class="form-label">Organizer Name</label>
            <input
              id="organizer"
              v-model="formData.organizer"
              type="text"
              class="form-control"
              placeholder="Your name"
            />
            <small class="form-text text-muted">This will be displayed as the event organizer</small>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary btn-lg"
            :disabled="loading"
          >
            <span v-if="!loading">Create Event</span>
            <span v-else>
              <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Creating...
            </span>
          </button>

          <button
            type="button"
            class="btn btn-secondary btn-lg"
            :disabled="loading"
            @click="resetForm"
          >
            Reset Form
          </button>

          <router-link to="/events" class="btn btn-outline-secondary btn-lg">
            View Events
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>
<style scoped>
.create-event-container {
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
}

.create-event-form {
  background: #f9fafb;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #1f2937;
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.form-section:last-of-type {
  border-bottom: none;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #374151;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #1f2937;
}

.required {
  color: #dc3545;
}

.form-control {
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 0.75rem;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-control:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.form-control.is-invalid:focus {
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

.invalid-feedback {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #dc3545;
}

.form-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #6b7280;
}

textarea.form-control {
  resize: vertical;
  font-family: inherit;
}

.row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.col-md-6 {
  flex: 1;
}

.image-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-img {
  max-width: 300px;
  max-height: 300px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-primary:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #4b5563;
}

.btn-secondary:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}

.btn-outline-secondary {
  background-color: transparent;
  color: #6b7280;
  border: 1px solid #6b7280;
}

.btn-outline-secondary:hover {
  background-color: #f3f4f6;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-lg {
  padding: 0.875rem 1.75rem;
  font-size: 1.0625rem;
}

.alert {
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
  border: 1px solid transparent;
}

.alert-success {
  background-color: #d4edda;
  border-color: #c3e6cb;
  color: #155724;
}

.alert-danger {
  background-color: #f8d7da;
  border-color: #f5c6cb;
  color: #721c24;
}

.alert-warning {
  background-color: #fff3cd;
  border-color: #ffeeba;
  color: #856404;
}

.alert a {
  font-weight: 600;
  color: inherit;
}

.spinner-border {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  vertical-align: text-bottom;
  border: 0.25em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border 0.75s linear infinite;
}

.spinner-border-sm {
  width: 0.75rem;
  height: 0.75rem;
  border-width: 0.2em;
}

.me-2 {
  margin-right: 0.5rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-3 {
  margin-top: 1rem;
}

@keyframes spinner-border {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .create-event-container {
    padding: 1rem;
  }

  .create-event-form {
    padding: 1rem;
  }

  .form-title {
    font-size: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-lg {
    width: 100%;
  }

  .row {
    grid-template-columns: 1fr;
  }
}

@keyframes spinner-border {
  to {
    transform: rotate(360deg);
  }
}
</style>
