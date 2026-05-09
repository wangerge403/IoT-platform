import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Dashboard from '../views/Dashboard.vue'
import ResetPassword from '../views/ResetPassword.vue'
import Devices from '../views/Devices.vue'
import Alarms from '../views/Alarms.vue'
import Analytics from '../views/Analytics.vue'
import Settings from '../views/Settings.vue'
import Permissions from '../views/Permissions.vue'

const routes = [
    { path: '/', name: 'Login', component: Login },
    {
        path: '/home',
        name: 'Home',
        component: Home,
        meta: { requiresAuth: true },
        children: [
            { path: '/home', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
            { path: '/devices', name: 'Devices', component: Devices, meta: { requiresAuth: true } },
            { path: '/alarms', name: 'Alarms', component: Alarms, meta: { requiresAuth: true } },
            { path: '/analytics', name: 'Analytics', component: Analytics, meta: { requiresAuth: true } },
            { path: '/settings', name: 'Settings', component: Settings, meta: { requiresAuth: true } },
            { path: '/permissions', name: 'Permissions', component: Permissions, meta: { requiresAuth: true } },
        ]
    },
    { path: '/reset-password', name: 'ResetPassword', component: ResetPassword }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth && !localStorage.getItem('user')) {
        next('/')
    } else {
        next()
    }
})

export default router
