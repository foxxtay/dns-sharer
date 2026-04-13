import { createRouter, createWebHistory } from 'vue-router'
import CreateView from '../views/CreateView.vue'
import ShareView from '../views/ShareView.vue'

const routes = [
  { path: '/', name: 'create', component: CreateView },
  { path: '/s/:data', name: 'share', component: ShareView },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
