import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import axios from 'axios'

// 配置后端接口基础地址
axios.defaults.baseURL = 'http://localhost:8082'

// 请求拦截器：携带token
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = 'Bearer ' + token
  }
  return config
})

// 响应拦截器：处理错误
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('请求错误:', error)
    if (error.response?.status === 401) {
      localStorage.removeItem('user')
      router.push('/')
    }
    return Promise.reject(error)
  }
)

const app = createApp(App)

// 全局注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(router)
app.use(ElementPlus)
app.config.globalProperties.$axios = axios
app.mount('#app')
