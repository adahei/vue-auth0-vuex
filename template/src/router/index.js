import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'

Vue.use(VueRouter)

const refreshToken = (to, from, next) => {
  if (!store.getters.isAuthenticated && typeof store.state.auth0.refreshToken === 'string') {
    return store.dispatch('AUTH0_REFRESH_TOKEN').then(() => next())
  }

  next()
}

const requireAnon = (to, from, next) => {
  if (store.getters.isAuthenticated) {
    return next({ name: 'index' })
  }

  next()
}

const requireAuth = (to, from, next) => {
  if (!store.getters.isAuthenticated || store.getters.isTokenExpired) {
    return store.dispatch('AUTH0_LOGOUT').then(() => next({ name: 'login' }))
  }

  next()
}

const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', component: { render: h => h('router-view') }, beforeEnter: refreshToken, children: [
      { path: '/', name: 'index', component: Dashboard, beforeEnter: requireAuth, children: [
        { path: 'logout', name: 'logout', beforeEnter: (to, from, next) => {
          store.dispatch('AUTH0_LOGOUT').then(() => next({ name: 'login' }))
        }}
      ]},
      { path: '/login', name: 'login', component: Login, beforeEnter: requireAnon },
    ]}
  ]
})

export default router
