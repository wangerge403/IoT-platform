<template>
  <div class="settings-container">
    <div class="page-header">
      <h2>系统设置</h2>
      <p>管理平台基础配置</p>
    </div>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card class="setting-card">
          <template #header><span>个人信息</span></template>
          <el-form :model="profile" label-width="80px">
            <el-form-item label="用户名">
              <el-input v-model="profile.username" disabled />
            </el-form-item>
            <el-form-item label="昵称">
              <el-input v-model="profile.nickname" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="profile.email" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="profile.phone" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveProfile">保存</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="setting-card">
          <template #header><span>系统配置</span></template>
          <el-form label-width="100px">
            <el-form-item label="报警通知">
              <el-switch v-model="sysConfig.alarmNotify" active-color="#FF6700" />
            </el-form-item>
            <el-form-item label="自动刷新">
              <el-switch v-model="sysConfig.autoRefresh" active-color="#FF6700" />
            </el-form-item>
            <el-form-item label="刷新间隔">
              <el-select v-model="sysConfig.refreshInterval" style="width: 100%">
                <el-option label="10秒" :value="10" />
                <el-option label="30秒" :value="30" />
                <el-option label="60秒" :value="60" />
              </el-select>
            </el-form-item>
            <el-form-item label="数据保留">
              <el-select v-model="sysConfig.dataRetention" style="width: 100%">
                <el-option label="7天" :value="7" />
                <el-option label="30天" :value="30" />
                <el-option label="90天" :value="90" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveSysConfig">保存配置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card class="setting-card" style="margin-top: 16px;">
          <template #header><span>修改密码</span></template>
          <el-form :model="pwdForm" label-width="100px">
            <el-form-item label="当前密码">
              <el-input v-model="pwdForm.oldPwd" type="password" show-password />
            </el-form-item>
            <el-form-item label="新密码">
              <el-input v-model="pwdForm.newPwd" type="password" show-password />
            </el-form-item>
            <el-form-item label="确认密码">
              <el-input v-model="pwdForm.confirmPwd" type="password" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="changePwd">修改密码</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const profile = reactive({ username: '', nickname: '', email: '', phone: '' })
const sysConfig = reactive({ alarmNotify: true, autoRefresh: true, refreshInterval: 30, dataRetention: 30 })
const pwdForm = reactive({ oldPwd: '', newPwd: '', confirmPwd: '' })

onMounted(() => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    profile.username = user.username || ''
    profile.nickname = user.nickname || ''
    profile.email = user.email || ''
    profile.phone = user.phone || ''
  } catch {}
})

const saveProfile = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  Object.assign(user, { nickname: profile.nickname, email: profile.email, phone: profile.phone })
  localStorage.setItem('user', JSON.stringify(user))
  ElMessage.success('个人信息已保存')
}

const saveSysConfig = () => { ElMessage.success('系统配置已保存') }

const changePwd = () => {
  if (!pwdForm.oldPwd || !pwdForm.newPwd) return ElMessage.warning('请填写完整')
  if (pwdForm.newPwd !== pwdForm.confirmPwd) return ElMessage.error('两次密码不一致')
  if (pwdForm.newPwd.length < 6) return ElMessage.error('密码不能少于6位')
  ElMessage.success('密码修改成功')
  pwdForm.oldPwd = ''; pwdForm.newPwd = ''; pwdForm.confirmPwd = ''
}
</script>

<style scoped>
.settings-container { padding: 20px; width: 100%; }
.page-header { margin-bottom: 20px; }
.page-header h2 { margin: 0 0 8px; font-size: 22px; font-weight: 600; color: #333; }
.page-header p { margin: 0; color: #999; font-size: 14px; }
.setting-card { border-radius: 12px; border: 1px solid #f0f0f0; }
</style>
