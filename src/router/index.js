import { createRouter, createWebHistory } from 'vue-router'

import Login from '@/components/Login.vue'
import ForgotPassword from '@/components/ForgotPassword.vue'
import Otp from '@/components/Otp.vue'
import Admin from '@/components/Admin.vue'
import HomePage from '@/components/HomePage.vue'
import Profile from '@/components/Profile.vue'
import SignUp from '@/components/SignUp.vue'
import CreateEvent from '@/components/CreateEvent.vue'
import EventList from '@/components/EventList.vue'
import EventDetails from '@/components/EventDetails.vue'
import Terms from '@/components/Terms.vue'
import Privacy from '@/components/Privacy.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },

    {
      path: '/events',
      name: 'EventList',
      component: EventList,
    },

    {
      path: '/events/:id',
      name: 'EventDetails',
      component: EventDetails,
      props: true,
    },

    {
      path: '/profile',
      name: 'Profile',
      component: Profile,
    },

    {
      path: '/createevent',
      name: 'CreateEvent',
      component: CreateEvent,
    },

    {
      path: '/login',
      name: 'Login',
      component: Login,
    },

    {
      path: '/forgot-password',
      name: 'ForgotPassword',
      component: ForgotPassword,
    },

    {
      path: '/otp',
      name: 'Otp',
      component: Otp,
    },

    {
      path: '/signup',
      name: 'SignUp',
      component: SignUp,
    },

    {
      path: '/terms',
      name: 'Terms',
      component: Terms,
    },

    {
      path: '/privacy',
      name: 'Privacy',
      component: Privacy,
    },

    {
      path: '/admin',
      name: 'Admin',
      component: Admin,
    },

    
  ],
})

export default router