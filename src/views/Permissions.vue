<template>
  <div class="permissions-container">
    <div class="permissions-content">
      <!-- 页面标题 -->
      <div class="page-header">
        <h2>权限管理</h2>
        <p>管理平台用户角色与权限分配</p>
      </div>

      <!-- 角色概览卡片 -->
      <el-row :gutter="16" class="roles-overview">
        <el-col :span="8" v-for="role in roles" :key="role.key">
          <div class="role-card" :class="role.key">
            <div class="role-card-header">
              <div class="role-icon-wrap">
                <el-icon :size="24">
                  <Key v-if="role.key === 'admin'" />
                  <UserFilled v-if="role.key === 'operator'" />
                  <View v-if="role.key === 'viewer'" />
                </el-icon>
              </div>
              <div class="role-meta">
                <span class="role-name">{{ role.label }}</span>
                <span class="role-count">{{ getUserCountByRole(role.key) }} 人</span>
              </div>
            </div>
            <p class="role-desc">{{ role.description }}</p>
            <div class="role-perms">
              <el-tag
                v-for="perm in role.permissions.slice(0, 6)"
                :key="perm"
                size="small"
                effect="plain"
                class="perm-tag"
              >
                {{ getPermLabel(perm) }}
              </el-tag>
              <el-tag v-if="role.permissions.length > 6" size="small" effect="plain" class="perm-tag more">
                +{{ role.permissions.length - 6 }} 更多
              </el-tag>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 用户列表 -->
      <el-card class="users-card">
        <template #header>
          <div class="card-header">
            <span>用户列表</span>
            <el-button type="primary" size="small" @click="fetchData">
              <el-icon><Refresh /></el-icon> 刷新
            </el-button>
          </div>
        </template>

        <el-table :data="userList" style="width: 100%" v-loading="loading" stripe>
          <el-table-column prop="username" label="用户名" width="120">
            <template #default="scope">
              <div class="user-name-cell">
                <el-avatar :size="32" class="user-mini-avatar">
                  <el-icon><UserFilled /></el-icon>
                </el-avatar>
                <span>{{ scope.row.username }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="nickname" label="昵称" width="120" />
          <el-table-column prop="email" label="邮箱" min-width="180" />
          <el-table-column prop="phone" label="手机号" width="140" />
          <el-table-column prop="role" label="角色" width="160">
            <template #default="scope">
              <el-tag :type="getRoleTagType(scope.row.role)" effect="dark" round>
                {{ scope.row.roleName }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="isActive" label="状态" width="100">
            <template #default="scope">
              <el-switch
                v-model="scope.row.isActive"
                active-color="#FF6700"
                :disabled="scope.row.username === 'admin'"
                @change="(val) => toggleUserStatus(scope.row, val)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="280" fixed="right">
            <template #default="scope">
              <el-button
                size="small"
                type="primary"
                @click="openRoleDialog(scope.row)"
                :disabled="scope.row.username === 'admin'"
              >
                <el-icon><Setting /></el-icon> 分配角色
              </el-button>
              <el-button
                size="small"
                @click="viewPermissions(scope.row)"
              >
                <el-icon><View /></el-icon> 查看权限
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="deleteUser(scope.row)"
                :disabled="scope.row.username === 'admin'"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 权限矩阵 -->
      <el-card class="matrix-card">
        <template #header>
          <div class="card-header">
            <span>权限矩阵</span>
            <span class="matrix-hint">各角色拥有的权限一览</span>
          </div>
        </template>
        <div class="matrix-scroll">
          <table class="matrix-table">
            <thead>
              <tr>
                <th class="module-col">模块</th>
                <th class="perm-col">权限</th>
                <th v-for="role in roles" :key="role.key" class="role-col">
                  {{ role.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(group, module) in groupedPermissions" :key="module">
                <tr v-for="(perm, idx) in group" :key="perm.key">
                  <td v-if="idx === 0" :rowspan="group.length" class="module-cell">
                    {{ module }}
                  </td>
                  <td class="perm-cell">{{ perm.label }}</td>
                  <td v-for="role in roles" :key="role.key" class="check-cell">
                    <el-icon v-if="role.permissions.includes(perm.key)" class="check-icon yes">
                      <CircleCheck />
                    </el-icon>
                    <el-icon v-else class="check-icon no">
                      <CircleClose />
                    </el-icon>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </el-card>
    </div>

    <!-- 分配角色对话框 -->
    <el-dialog
      v-model="roleDialogVisible"
      title="分配角色"
      width="480px"
      class="role-dialog"
    >
      <div class="role-dialog-body">
        <div class="role-user-info">
          <el-avatar :size="48" class="dialog-avatar">
            <el-icon :size="24"><UserFilled /></el-icon>
          </el-avatar>
          <div>
            <div class="dialog-username">{{ currentUser?.nickname || currentUser?.username }}</div>
            <div class="dialog-useremail">{{ currentUser?.email }}</div>
          </div>
        </div>

        <el-divider />

        <div class="role-select-label">选择角色：</div>
        <el-radio-group v-model="selectedRole" class="role-radio-group">
          <el-radio-button
            v-for="role in roles"
            :key="role.key"
            :value="role.key"
            :disabled="currentUser?.username === 'admin' && role.key !== 'admin'"
          >
            <div class="role-radio-content">
              <el-icon>
                <Key v-if="role.key === 'admin'" />
                <UserFilled v-if="role.key === 'operator'" />
                <View v-if="role.key === 'viewer'" />
              </el-icon>
              <span>{{ role.label }}</span>
            </div>
          </el-radio-button>
        </el-radio-group>

        <div class="role-selected-desc" v-if="selectedRole">
          <el-icon><InfoFilled /></el-icon>
          <span>{{ roles.find(r => r.key === selectedRole)?.description }}</span>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAssignRole" :loading="assignLoading">
            确认分配
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看权限对话框 -->
    <el-dialog
      v-model="permDialogVisible"
      title="用户权限详情"
      width="560px"
      class="perm-dialog"
    >
      <div class="perm-dialog-body">
        <div class="perm-user-header">
          <el-avatar :size="56" class="perm-avatar">
            <el-icon :size="28"><UserFilled /></el-icon>
          </el-avatar>
          <div class="perm-user-meta">
            <div class="perm-username">{{ permUser?.nickname || permUser?.username }}</div>
            <el-tag :type="getRoleTagType(permUser?.role)" effect="dark" size="small" round>
              {{ permUser?.roleName }}
            </el-tag>
          </div>
        </div>

        <el-divider />

        <div class="perm-groups">
          <div v-for="(group, module) in permGrouped" :key="module" class="perm-group">
            <div class="perm-group-title">
              <el-icon><Document /></el-icon> {{ module }}
            </div>
            <div class="perm-group-items">
              <el-tag
                v-for="perm in group"
                :key="perm.key"
                :type="permUserPermissions.includes(perm.key) ? 'success' : 'info'"
                effect="plain"
                class="perm-detail-tag"
              >
                <el-icon v-if="permUserPermissions.includes(perm.key)"><CircleCheck /></el-icon>
                <el-icon v-else><CircleClose /></el-icon>
                {{ perm.label }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="permDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

// 数据
const loading = ref(false)
const userList = ref([])
const roles = ref([])
const allPermissions = ref([])

// 角色分配对话框
const roleDialogVisible = ref(false)
const currentUser = ref(null)
const selectedRole = ref('')
const assignLoading = ref(false)

// 权限查看对话框
const permDialogVisible = ref(false)
const permUser = ref(null)
const permUserPermissions = ref([])

// 获取角色下用户数量
const getUserCountByRole = (roleKey) => {
  return userList.value.filter(u => u.role === roleKey).length
}

// 获取权限标签
const getPermLabel = (permKey) => {
  const perm = allPermissions.value.find(p => p.key === permKey)
  return perm ? perm.label : permKey
}

// 获取角色标签类型
const getRoleTagType = (roleKey) => {
  const map = { admin: 'danger', operator: 'warning', viewer: 'info' }
  return map[roleKey] || 'info'
}

// 按模块分组权限
const groupedPermissions = computed(() => {
  const groups = {}
  allPermissions.value.forEach(p => {
    if (!groups[p.module]) groups[p.module] = []
    groups[p.module].push(p)
  })
  return groups
})

// 查看权限时按模块分组
const permGrouped = computed(() => {
  const groups = {}
  allPermissions.value.forEach(p => {
    if (!groups[p.module]) groups[p.module] = []
    groups[p.module].push(p)
  })
  return groups
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const [userRes, roleRes, permRes] = await Promise.all([
      axios.get('http://localhost:8082/userList'),
      axios.get('http://localhost:8082/roles'),
      axios.get('http://localhost:8082/permissions'),
    ])
    if (userRes.data.code === 200) userList.value = userRes.data.data || []
    if (roleRes.data.code === 200) roles.value = roleRes.data.data || []
    if (permRes.data.code === 200) allPermissions.value = permRes.data.data || []
  } catch {
    ElMessage.error('获取数据失败，请检查后端服务')
  } finally {
    loading.value = false
  }
}

// 打开角色分配对话框
const openRoleDialog = (user) => {
  currentUser.value = user
  selectedRole.value = user.role || 'viewer'
  roleDialogVisible.value = true
}

// 确认分配角色
const confirmAssignRole = async () => {
  if (!currentUser.value || !selectedRole.value) return
  assignLoading.value = true
  try {
    const res = await axios.put('http://localhost:8082/assignRole', {
      username: currentUser.value.username,
      role: selectedRole.value,
    })
    if (res.data.code === 200) {
      ElMessage.success(res.data.msg)
      roleDialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.data.msg)
    }
  } catch {
    ElMessage.error('操作失败')
  } finally {
    assignLoading.value = false
  }
}

// 切换用户状态
const toggleUserStatus = async (user, val) => {
  try {
    const res = await axios.put('http://localhost:8082/updateUserStatus', {
      username: user.username,
      isActive: val,
    })
    if (res.data.code === 200) {
      ElMessage.success(res.data.msg)
    } else {
      ElMessage.error(res.data.msg)
      user.isActive = !val
    }
  } catch {
    ElMessage.error('操作失败')
    user.isActive = !val
  }
}

// 查看用户权限
const viewPermissions = async (user) => {
  permUser.value = user
  try {
    const res = await axios.get(`http://localhost:8082/userPermissions/${user.username}`)
    if (res.data.code === 200) {
      permUserPermissions.value = res.data.data.permissions || []
      permDialogVisible.value = true
    } else {
      ElMessage.error(res.data.msg)
    }
  } catch {
    ElMessage.error('获取权限信息失败')
  }
}

// 删除用户
const deleteUser = (user) => {
  ElMessageBox.confirm(
    `确定要删除用户「${user.nickname || user.username}」吗？此操作不可恢复。`,
    '确认删除',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(async () => {
    try {
      const res = await axios.delete('http://localhost:8082/deleteUser', {
        params: { username: user.username },
      })
      if (res.data.code === 200) {
        ElMessage.success(res.data.msg)
        fetchData()
      } else {
        ElMessage.error(res.data.msg)
      }
    } catch {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.permissions-container {
  padding: 20px;
  height: 100%;
  display: flex;
  justify-content: center;
  width: 100%;
}

.permissions-content {
  width: 100%;
  max-width: 1400px;
}

/* 页面标题 */
.page-header {
  margin-bottom: 20px;
}
.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}
.page-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

/* 角色概览卡片 */
.roles-overview {
  margin-bottom: 20px;
}

.role-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}
.role-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.role-card.admin {
  border-top: 3px solid #f56c6c;
}
.role-card.operator {
  border-top: 3px solid #e6a23c;
}
.role-card.viewer {
  border-top: 3px solid #909399;
}

.role-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.role-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.role-card.admin .role-icon-wrap {
  background: #fef0f0;
  color: #f56c6c;
}
.role-card.operator .role-icon-wrap {
  background: #fdf6ec;
  color: #e6a23c;
}
.role-card.viewer .role-icon-wrap {
  background: #f4f4f5;
  color: #909399;
}

.role-meta {
  display: flex;
  flex-direction: column;
}
.role-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
.role-count {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.role-desc {
  font-size: 13px;
  color: #606266;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.role-perms {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.perm-tag {
  font-size: 11px;
  border-radius: 4px;
}
.perm-tag.more {
  color: #FF6700;
  border-color: #FFD6B3;
  background: #FFF8F0;
}

/* 用户列表卡片 */
.users-card {
  margin-bottom: 20px;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.user-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.user-mini-avatar {
  background: #FF6700;
  color: #fff;
  flex-shrink: 0;
}

/* 权限矩阵 */
.matrix-card {
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.matrix-hint {
  font-size: 12px;
  font-weight: 400;
  color: #909399;
}

.matrix-scroll {
  overflow-x: auto;
}

.matrix-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.matrix-table th,
.matrix-table td {
  padding: 10px 14px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}
.matrix-table th {
  background: #fafafa;
  font-weight: 600;
  color: #303133;
  position: sticky;
  top: 0;
}
.module-col { text-align: left; width: 100px; }
.perm-col { text-align: left; width: 120px; }
.role-col { width: 120px; }

.module-cell {
  text-align: left;
  font-weight: 600;
  color: #FF6700;
  background: #fffaf6;
  vertical-align: middle;
}
.perm-cell {
  text-align: left;
  color: #606266;
}

.check-cell {
  vertical-align: middle;
}
.check-icon.yes {
  color: #67c23a;
  font-size: 18px;
}
.check-icon.no {
  color: #dcdfe6;
  font-size: 18px;
}

/* 分配角色对话框 */
.role-dialog :deep(.el-dialog) {
  border-radius: 15px;
}
.role-dialog :deep(.el-dialog__header) {
  background: #FF6700;
  color: #fff;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
}
.role-dialog :deep(.el-dialog__title) {
  color: #fff;
}
.role-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #fff;
}

.role-dialog-body {
  padding: 10px 0;
}
.role-user-info {
  display: flex;
  align-items: center;
  gap: 14px;
}
.dialog-avatar {
  background: #FF6700;
  color: #fff;
}
.dialog-username {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
.dialog-useremail {
  font-size: 13px;
  color: #909399;
  margin-top: 2px;
}

.role-select-label {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 12px;
}

.role-radio-group {
  display: flex;
  gap: 12px;
  width: 100%;
}
.role-radio-group :deep(.el-radio-button) {
  flex: 1;
}
.role-radio-group :deep(.el-radio-button__inner) {
  width: 100%;
  border-radius: 8px !important;
  border-left: 1px solid #dcdfe6 !important;
  padding: 14px 16px;
}
.role-radio-group :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #FF6700;
  border-color: #FF6700;
  box-shadow: -1px 0 0 0 #FF6700;
}

.role-radio-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.role-radio-content .el-icon {
  font-size: 20px;
}

.role-selected-desc {
  margin-top: 16px;
  padding: 12px 16px;
  background: #FFF8F0;
  border-radius: 8px;
  border: 1px solid #FFD6B3;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #E6A23C;
}

/* 查看权限对话框 */
.perm-dialog :deep(.el-dialog) {
  border-radius: 15px;
}
.perm-dialog :deep(.el-dialog__header) {
  background: #FF6700;
  color: #fff;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
}
.perm-dialog :deep(.el-dialog__title) {
  color: #fff;
}
.perm-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #fff;
}

.perm-dialog-body {
  padding: 10px 0;
}

.perm-user-header {
  display: flex;
  align-items: center;
  gap: 14px;
}
.perm-avatar {
  background: #FF6700;
  color: #fff;
}
.perm-user-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}
.perm-username {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.perm-groups {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.perm-group {
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 8px;
}
.perm-group-title {
  font-size: 13px;
  font-weight: 600;
  color: #FF6700;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.perm-group-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.perm-detail-tag {
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.perm-detail-tag .el-icon {
  font-size: 14px;
}
</style>
