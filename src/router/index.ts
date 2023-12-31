import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'setup',
      component: HomeView
    },
    {
      path: '/address',
      name: 'address',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AddressView.vue')
    },
    {
      path: '/opreturn',
      name: 'opreturn',
      component: () => import('../views/OpReturnView.vue')
    }
  ]
})

export default router
