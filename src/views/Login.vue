<template>
  <div class="login-container">
    <div class="login-wrapper">
      <div class="login-box">
        <div class="login-logo">
          <div class="logo-circle">
            <el-icon class="logo-icon"><HomeFilled /></el-icon>
          </div>
          <h1>IoT 云平台</h1>
          <p>链接未来，智享生活</p>
        </div>
        <el-tabs v-model="activeTab" class="login-tabs" stretch>
          <el-tab-pane label="登录" name="login">
            <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="0px" @submit.prevent="handleLogin">
              <el-form-item prop="username">
                <el-input v-model="loginForm.username" placeholder="请输入用户名" prefix-icon="User" clearable size="large" @keyup.enter="handleLogin" />
              </el-form-item>
              <el-form-item prop="password">
                <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" prefix-icon="Lock" show-password size="large" @keyup.enter="handleLogin" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" class="login-button" @click="handleLogin" :loading="loginLoading" size="large" round>
                  {{ loginLoading ? '登录中...' : '登录' }}
                </el-button>
              </el-form-item>
              <div class="login-options">
                <el-checkbox v-model="rememberMe">记住我</el-checkbox>
                <el-link type="primary" @click="goToResetPassword">忘记密码?</el-link>
              </div>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="注册" name="register">
            <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" label-width="0px" @submit.prevent="handleRegister">
              <el-form-item prop="username">
                <el-input v-model="registerForm.username" placeholder="请输入用户名" prefix-icon="User" clearable size="large" />
              </el-form-item>
              <el-form-item prop="nickname">
                <el-input v-model="registerForm.nickname" placeholder="请输入昵称" prefix-icon="User" clearable size="large" />
              </el-form-item>
              <el-form-item prop="password">
                <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" prefix-icon="Lock" show-password size="large" />
              </el-form-item>
              <el-form-item prop="confirmPassword">
                <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请确认密码" prefix-icon="Lock" show-password size="large" />
              </el-form-item>
              <el-form-item prop="email">
                <el-input v-model="registerForm.email" placeholder="请输入邮箱" prefix-icon="Message" clearable size="large" />
              </el-form-item>
              <el-form-item prop="phone">
                <el-input v-model="registerForm.phone" placeholder="请输入手机号" prefix-icon="Phone" clearable size="large" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" class="register-button" @click="handleRegister" :loading="registerLoading" size="large" round>
                  {{ registerLoading ? '注册中...' : '注册' }}
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
        <div class="message-area">
          <p class="error-message" v-if="errorMsg">{{ errorMsg }}</p>
        </div>
      </div>
      <div class="login-footer"><p>© 2025 IoT 云平台</p></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const activeTab = ref('login')
const loginLoading = ref(false)
const registerLoading = ref(false)
const errorMsg = ref('')
const rememberMe = ref(false)
const loginFormRef = ref()
const registerFormRef = ref()

const loginForm = reactive({ username: 'admin', password: '123456' })
const registerForm = reactive({ username: '', nickname: '', password: '', confirmPassword: '', email: '', phone: '' })

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}
const registerRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }],
  confirmPassword: [{ required: true, message: '请确认密码', trigger: 'blur' }, {
    validator: (_rule, value, callback) => { value !== registerForm.password ? callback(new Error('两次输入的密码不一致')) : callback() }, trigger: 'blur'
  }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }, { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }]
}

onMounted(() => {
  const saved = localStorage.getItem('savedUsername')
  if (saved) { loginForm.username = saved; rememberMe.value = true }
})

const handleLogin = async () => {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    loginLoading.value = true; errorMsg.value = ''
    try {
      const res = await axios.get('http://localhost:8082/login', { params: { username: loginForm.username, password: loginForm.password } })
      if (res.data.code === 200 && res.data.data) {
        localStorage.setItem('user', JSON.stringify(res.data.data))
        localStorage.setItem('token', res.data.data.token)
        if (rememberMe.value) localStorage.setItem('savedUsername', loginForm.username)
        ElMessage.success('登录成功'); router.push('/home')
      } else { errorMsg.value = res.data.msg || '用户名或密码错误' }
    } catch { errorMsg.value = '连接后端失败，请检查服务是否启动' }
    finally { loginLoading.value = false }
  })
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return
    registerLoading.value = true; errorMsg.value = ''
    try {
      const res = await axios.post('http://localhost:8082/register', {
        username: registerForm.username, nickname: registerForm.nickname, password: registerForm.password,
        email: registerForm.email, phone: registerForm.phone, isActive: true
      })
      if (res.data.code === 200) {
        ElMessage.success('注册成功')
        Object.keys(registerForm).forEach(k => { registerForm[k] = '' })
        activeTab.value = 'login'
      } else { errorMsg.value = res.data.msg || '注册失败' }
    } catch { errorMsg.value = '连接后端失败，请检查服务是否启动' }
    finally { registerLoading.value = false }
  })
}

const goToResetPassword = () => { router.push('/reset-password') }
</script>

<style scoped>
.login-container {
  display: flex; justify-content: center; align-items: center;
  min-height: 100vh; width: 100vw;
  background: #f5f5f5;
}
.login-wrapper {
  width: 100%; max-width: 420px; padding: 20px;
  display: flex; flex-direction: column; align-items: center;
}
.login-box {
  background: #fff; border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  padding: 40px 32px; width: 100%;
}
.login-logo { text-align: center; margin-bottom: 28px; }
.logo-circle {
  width: 64px; height: 64px;
  background: #FF6700; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px;
}
.logo-icon { font-size: 32px; color: white; }
.login-logo h1 { margin: 0 0 8px; font-size: 22px; font-weight: 600; color: #333; }
.login-logo p { margin: 0; color: #999; font-size: 14px; }

.login-tabs { margin-bottom: 16px; }
.login-tabs :deep(.el-tabs__nav-wrap::after) { display: none; }
.login-tabs :deep(.el-tabs__item) { font-size: 15px; font-weight: 500; }
.login-tabs :deep(.el-tabs__item.is-active) { color: #FF6700; }
.login-tabs :deep(.el-tabs__active-bar) { background-color: #FF6700; }

.login-button, .register-button {
  width: 100%; height: 44px; font-size: 15px;
  background: #FF6700 !important; border-color: #FF6700 !important;
}
.login-button:hover, .register-button:hover {
  background: #ff8533 !important; border-color: #ff8533 !important;
}
.login-options { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; }
.login-options :deep(.el-link) { color: #FF6700; }
.login-options :deep(.el-checkbox__input.is-checked .el-checkbox__inner) { background-color: #FF6700; border-color: #FF6700; }

.message-area { margin-top: 16px; }
.error-message { color: #f56c6c; font-size: 13px; text-align: center; margin: 0; }

.login-footer { text-align: center; margin-top: 24px; }
.login-footer p { margin: 0; font-size: 12px; color: #ccc; }
</style>
