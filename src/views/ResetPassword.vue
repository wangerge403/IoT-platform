<template>
  <div class="reset-container">
    <el-card class="reset-card">
      <template #header>
        <div class="card-header">
          <span>密码重置</span>
        </div>
      </template>
      <el-form ref="resetFormRef" :model="resetForm" :rules="rules" label-width="100px">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="resetForm.email" placeholder="请输入注册邮箱"></el-input>
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <el-row :gutter="10">
            <el-col :span="16">
              <el-input v-model="resetForm.code" placeholder="请输入验证码"></el-input>
            </el-col>
            <el-col :span="8">
              <el-button
                  type="primary"
                  @click="sendCode"
                  :disabled="countdown > 0"
              >
                {{ countdown > 0 ? `${countdown}秒后重发` : '发送验证码' }}
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="resetForm.newPassword" type="password" placeholder="请输入新密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleReset">重置密码</el-button>
          <el-button @click="goToLogin" style="margin-left: 10px;">返回登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElForm } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const resetFormRef = ref()

const resetForm = reactive({
  email: '',
  code: '',
  newPassword: ''
})

const countdown = ref(0) // 验证码倒计时

// 表单验证规则
const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

// 发送验证码
const sendCode = async () => {
  if (!resetForm.email) {
    ElMessage.warning('请先输入邮箱')
    return
  }
  
  try {
    // 调用后端发送验证码接口
    const response = await axios.get('/sendEmail', {
      params: {
        toEmail: resetForm.email
      }
    })
    
    if (response.data.code === 200) {
      ElMessage.success('验证码已发送至邮箱')
      // 开始倒计时
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    } else {
      ElMessage.error(response.data.msg || '发送失败')
    }
  } catch (error) {
    console.error('发送验证码失败:', error)
    ElMessage.error('发送失败，请检查邮箱是否正确')
  }
}

// 重置密码
const handleReset = async () => {
  if (!resetFormRef.value) return
  
  await resetFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 调用后端重置密码接口
        const response = await axios.put('/updatePassword', null, {
          params: {
            code: resetForm.code,
            password: resetForm.newPassword,
            email: resetForm.email
          }
        })
        
        if (response.data.code === 200) {
          ElMessage.success('密码重置成功，请登录')
          router.push('/') // 跳回登录页
        } else {
          ElMessage.error(response.data.msg || '重置失败')
        }
      } catch (error) {
        console.error('重置密码失败:', error)
        ElMessage.error('重置失败，请检查信息')
      }
    }
  })
}

const goToLogin = () => {
  router.push('/')
}
</script>

<style scoped>
.reset-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.reset-card {
  width: 500px;
  padding: 20px;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}
</style>