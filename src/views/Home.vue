<template>
  <div class="home-container">
    <el-container class="main-container">
      <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
        <div class="logo" :class="{ collapsed: isCollapse }">
          <div class="logo-icon-wrap">
            <el-icon :size="22" color="#FF6700"><HomeFilled /></el-icon>
          </div>
          <div v-if="!isCollapse" class="logo-info">
            <span class="logo-text">IoT 云平台</span>
            <el-tag type="success" size="small" effect="plain" class="status-tag">系统运行正常</el-tag>
          </div>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          :collapse="isCollapse"
          :collapse-transition="false"
          background-color="#fff"
          text-color="#333"
          active-text-color="#FF6700"
          unique-opened
          @select="handleMenuSelect"
        >
          <el-menu-item index="/home">
            <el-icon><House /></el-icon>
            <template #title>首页</template>
          </el-menu-item>
          <el-menu-item index="/devices">
            <el-icon><Monitor /></el-icon>
            <template #title>设备管理</template>
          </el-menu-item>
          <el-menu-item index="/alarms">
            <el-icon><Bell /></el-icon>
            <template #title>报警信息</template>
          </el-menu-item>
          <el-menu-item index="/analytics">
            <el-icon><DataAnalysis /></el-icon>
            <template #title>数据分析</template>
          </el-menu-item>
          <el-menu-item index="/settings">
            <el-icon><Setting /></el-icon>
            <template #title>系统设置</template>
          </el-menu-item>
          <el-menu-item index="/permissions">
            <el-icon><Key /></el-icon>
            <template #title>权限管理</template>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container class="content-container">
        <el-header class="header">
          <div class="header-left">
            <el-button class="menu-toggle" @click="toggleCollapse" text>
              <el-icon :size="20">
                <Expand v-if="isCollapse" />
                <Fold v-else />
              </el-icon>
            </el-button>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item v-for="(item, i) in breadcrumbItems" :key="i">
                {{ item }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <div class="header-stats">
              <div class="header-stat online">
                <span class="stat-dot"></span>
                <span>在线 {{ onlineDevices }}</span>
              </div>
              <div class="header-stat alarm" @click="router.push('/alarms')">
                <span class="stat-dot"></span>
                <span>报警 {{ alarmCount }}</span>
              </div>
            </div>
            <el-popover placement="bottom-end" :width="320" trigger="click">
              <template #reference>
                <el-badge :value="notifications.filter(n => !n.read).length || undefined" :max="99">
                  <el-button circle size="small" class="notify-btn">
                    <el-icon :size="18"><ChatDotRound /></el-icon>
                  </el-button>
                </el-badge>
              </template>
              <div class="notify-panel">
                <div class="notify-header">
                  <span>通知消息</span>
                  <el-button link size="small" @click="clearAll">全部已读</el-button>
                </div>
                <div class="notify-list">
                  <div
                    v-for="n in notifications"
                    :key="n.id"
                    class="notify-item"
                    :class="{ unread: !n.read }"
                    @click="handleNotifyClick(n)"
                  >
                    <div class="notify-dot" :class="n.type"></div>
                    <div class="notify-body">
                      <div class="notify-msg">{{ n.message }}</div>
                      <div class="notify-time">{{ n.time }}</div>
                    </div>
                  </div>
                </div>
                <div class="notify-footer">
                  <el-button link @click="router.push('/alarms')">查看全部报警</el-button>
                </div>
              </div>
            </el-popover>
            <el-dropdown @command="handleUserCommand" popper-class="user-popper">
              <span class="user-dropdown">
                <el-avatar :size="34" class="user-avatar">
                  <el-icon :size="18"><UserFilled /></el-icon>
                </el-avatar>
                <div class="user-meta">
                    <span class="uname">{{ user?.nickname || user?.username }}</span>
                    <span class="urole">{{ user?.roleName || '用户' }}</span>
                </div>
                <el-icon class="arrow-icon"><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <div class="dropdown-user-header">
                    <el-avatar :size="40" class="dropdown-avatar">
                      <el-icon :size="20"><UserFilled /></el-icon>
                    </el-avatar>
                    <div class="dropdown-user-info">
                      <div class="dropdown-uname">{{ user?.nickname || user?.username }}</div>
                      <div class="dropdown-uemail">{{ user?.email || 'admin@iot.com' }}</div>
                    </div>
                  </div>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>个人资料
                  </el-dropdown-item>
                  <el-dropdown-item command="settings">
                    <el-icon><Setting /></el-icon>系统设置
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        <el-main class="main-content">
          <router-view />
        </el-main>
        <el-footer class="footer" height="40px">
          <span>© 2025 IoT 云平台</span>
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const user = ref(null)
const isCollapse = ref(false)
const avatarUrl = ref('')
const onlineDevices = ref(12)
const alarmCount = ref(2)

const notifications = ref([
  { id: 1, message: '客厅烟雾传感器检测到烟雾浓度超标', time: '5分钟前', type: 'danger', read: false },
  { id: 2, message: '主卧温度超过设定阈值 35°C', time: '1小时前', type: 'warning', read: false },
  { id: 3, message: '厨房咖啡机水箱水位过低', time: '3小时前', type: 'info', read: true },
  { id: 4, message: '前门智能锁密码输入错误已锁定', time: '昨天', type: 'danger', read: true },
])

const handleNotifyClick = (n) => {
  n.read = true
  router.push('/alarms')
}

const clearAll = () => {
  notifications.value.forEach(n => { n.read = true })
}

const activeMenu = computed(() => route.path)

const breadcrumbItems = computed(() => {
  const map = {
    '/home': ['首页'],
    '/devices': ['设备管理'],
    '/alarms': ['报警信息'],
    '/analytics': ['数据分析'],
    '/settings': ['系统设置'],
    '/permissions': ['权限管理']
  }
  return map[route.path] || ['首页']
})

const handleMenuSelect = (index) => { router.push(index) }
const toggleCollapse = () => { isCollapse.value = !isCollapse.value }

onMounted(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try { user.value = JSON.parse(userStr) } catch (e) { logout() }
  } else { logout() }
})

const handleUserCommand = (cmd) => {
  if (cmd === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '确认退出', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
    }).then(() => logout()).catch(() => {})
  } else {
    ElMessage.info('功能开发中')
  }
}

const logout = () => { localStorage.removeItem('user'); router.push('/') }
</script>

<style scoped>
.home-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
.main-container {
  height: 100vh;
  width: 100%;
}
.content-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 侧边栏 */
.sidebar {
  background: #fff;
  border-right: 1px solid #f0f0f0;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.logo {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #f0f0f0;
  gap: 10px;
}
.logo.collapsed {
  justify-content: center;
  padding: 0;
}
.logo-icon-wrap {
  width: 34px;
  height: 34px;
  background: #FFF3E0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 11px;
}
.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
}
.logo-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.status-tag {
  font-size: 11px;
  height: 18px;
  line-height: 16px;
  padding: 0 6px;
  border-radius: 4px;
  width: fit-content;
}

/* 菜单项 */
.sidebar-menu {
  border-right: none !important;
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}
.sidebar-menu :deep(.el-menu-item) {
  height: 44px;
  line-height: 44px;
  margin: 2px 8px;
  border-radius: 8px;
  font-size: 14px;
  transition: background 0.2s, color 0.2s;
}
.sidebar-menu :deep(.el-menu-item:hover) {
  background: #FFF3E0 !important;
  color: #FF6700 !important;
}
.sidebar-menu :deep(.el-menu-item.is-active) {
  background: #FFF3E0 !important;
  color: #FF6700 !important;
  font-weight: 500;
}
.sidebar-menu :deep(.el-menu-item .el-icon) {
  font-size: 18px;
}

/* 头部 */
.header {
  height: 56px !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.menu-toggle {
  color: #666;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 头部状态指示器 */
.header-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}
.header-stat {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  cursor: default;
}
.header-stat.online {
  background: #E8F5E9;
  color: #2E7D32;
}
.header-stat.alarm {
  background: #FFF3E0;
  color: #E65100;
  cursor: pointer;
  transition: background 0.2s;
}
.header-stat.alarm:hover {
  background: #FFE0B2;
}
.stat-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.header-stat.online .stat-dot {
  background: #4CAF50;
  box-shadow: 0 0 4px rgba(76,175,80,0.5);
}
.header-stat.alarm .stat-dot {
  background: #FF6700;
  box-shadow: 0 0 4px rgba(255,103,0,0.5);
}
.user-dropdown {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: #333;
  padding: 4px 10px 4px 4px;
  border-radius: 22px;
  transition: background 0.2s;
}
.user-dropdown:hover {
  background: #f5f5f5;
}
.user-avatar {
  background: #FF6700;
  color: #fff;
}
.user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}
.uname {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}
.urole {
  font-size: 11px;
  color: #bbb;
}
.arrow-icon {
  font-size: 12px;
  color: #bbb;
  transition: transform 0.2s;
}

/* 主内容 */
.main-content {
  background: #f5f5f5;
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 通知按钮 */
.notify-btn {
  border: 1px solid #e0e0e0;
}
.notify-btn:hover {
  border-color: #FF6700;
  color: #FF6700;
}

/* 通知面板 */
.notify-panel {
  margin: -12px;
}
.notify-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}
.notify-list {
  max-height: 300px;
  overflow-y: auto;
}
.notify-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s;
}
.notify-item:hover {
  background: #fafafa;
}
.notify-item.unread {
  background: #FFF8F0;
}
.notify-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 5px;
  flex-shrink: 0;
}
.notify-dot.danger { background: #f44336; }
.notify-dot.warning { background: #FF9800; }
.notify-dot.info { background: #2196F3; }
.notify-body { flex: 1; }
.notify-msg {
  font-size: 13px;
  color: #333;
  line-height: 1.4;
}
.notify-time {
  font-size: 11px;
  color: #bbb;
  margin-top: 4px;
}
.notify-footer {
  padding: 10px 16px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
}
.notify-footer .el-button {
  color: #FF6700;
}

/* 用户下拉面板 */
.dropdown-user-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 4px;
}
.dropdown-avatar {
  background: #FF6700;
  color: #fff;
  flex-shrink: 0;
}
.dropdown-user-info {
  flex: 1;
}
.dropdown-uname {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}
.dropdown-uemail {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

/* 底部 */
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  font-size: 12px;
  color: #999;
}
</style>
