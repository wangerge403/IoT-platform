<template>
  <div class="devices-container">
    <div class="devices-content">
      <!-- 页面标题 -->
      <div class="page-header">
        <h2>设备管理</h2>
        <p>管理系统中的所有智能设备</p>
      </div>
      
      <!-- 操作栏 -->
      <el-card class="operation-card">
        <div class="operation-bar">
          <div class="left-actions">
            <el-button type="primary" @click="showAddDeviceDialog">
              <el-icon><Plus /></el-icon>
              添加设备
            </el-button>
            <el-button @click="refreshDevices">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
          
          <div class="right-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索设备名称或ID..."
              style="width: 300px"
              clearable
              @clear="searchKeyword = ''"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>
      </el-card>
      
      <!-- 设备统计 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <div class="stat-card online">
            <div class="stat-content">
              <el-icon class="stat-icon"><Monitor /></el-icon>
              <div class="stat-info">
                <div class="stat-number">{{ onlineDevices }}</div>
                <div class="stat-label">在线设备</div>
              </div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="stat-card offline">
            <div class="stat-content">
              <el-icon class="stat-icon"><Monitor /></el-icon>
              <div class="stat-info">
                <div class="stat-number">{{ offlineDevices }}</div>
                <div class="stat-label">离线设备</div>
              </div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="stat-card total">
            <div class="stat-content">
              <el-icon class="stat-icon"><DataAnalysis /></el-icon>
              <div class="stat-info">
                <div class="stat-number">{{ totalDevices }}</div>
                <div class="stat-label">总设备数</div>
              </div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="stat-card warning">
            <div class="stat-content">
              <el-icon class="stat-icon"><Warning /></el-icon>
              <div class="stat-info">
                <div class="stat-number">{{ warningDevices }}</div>
                <div class="stat-label">异常设备</div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
      
      <!-- 设备列表 -->
      <el-card class="devices-card">
        <el-table 
          :data="paginatedDevices" 
          style="width: 100%" 
          v-loading="loading"
          stripe
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="deviceId" label="设备ID" width="80" sortable />
          <el-table-column prop="deviceName" label="设备名称" min-width="150" sortable>
            <template #default="scope">
              <div class="device-name-cell">
                <el-icon class="device-icon"><Monitor /></el-icon>
                <span>{{ scope.row.deviceName }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="deviceType" label="设备类型" width="100" sortable>
            <template #default="scope">
              <el-tag :type="getDeviceTypeTag(scope.row.deviceType)" effect="dark">
                {{ getDeviceTypeName(scope.row.deviceType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="roomId" label="房间ID" width="80" sortable />
          <el-table-column prop="status" label="状态" width="100" sortable>
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? '在线' : '离线' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="protocol" label="通信协议" width="100" sortable />
          <el-table-column prop="createdTime" label="创建时间" width="180" sortable />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="scope">
              <el-button 
                size="small" 
                type="primary" 
                @click="controlDevice(scope.row)"
              >
                控制
              </el-button>
              <el-button 
                size="small" 
                @click="editDevice(scope.row)"
              >
                编辑
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="deleteDevice(scope.row.deviceId)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="filteredDevices.length"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>
    
    <!-- 添加/编辑设备对话框 -->
    <el-dialog 
      v-model="deviceDialogVisible" 
      :title="editingDevice ? '编辑设备' : '添加设备'"
      width="500px"
      class="device-dialog"
    >
      <el-form 
        ref="deviceFormRef" 
        :model="deviceForm" 
        :rules="deviceFormRules" 
        label-width="100px"
      >
        <el-form-item label="设备名称" prop="deviceName">
          <el-input v-model="deviceForm.deviceName" placeholder="请输入设备名称" />
        </el-form-item>
        
        <el-form-item label="设备类型" prop="deviceType">
          <el-select v-model="deviceForm.deviceType" placeholder="请选择设备类型" style="width: 100%">
            <el-option
              v-for="type in deviceTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="房间ID" prop="roomId">
          <el-input-number 
            v-model="deviceForm.roomId" 
            :min="1" 
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="通信协议" prop="protocol">
          <el-select v-model="deviceForm.protocol" placeholder="请选择通信协议" style="width: 100%">
            <el-option label="WiFi" value="WiFi" />
            <el-option label="MQTT" value="MQTT" />
            <el-option label="ZigBee" value="ZigBee" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deviceDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="saveDevice"
            :loading="saveLoading"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

// 数据相关
const devices = ref([])
const loading = ref(false)
const saveLoading = ref(false)
const deviceDialogVisible = ref(false)
const editingDevice = ref(null)
const searchKeyword = ref('')
const selectedDevices = ref([])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)

// 表单引用
const deviceFormRef = ref()

// 设备表单数据
const deviceForm = reactive({
  deviceName: '',
  deviceType: 1,
  roomId: 1,
  protocol: 'WiFi'
})

// 设备类型选项
const deviceTypes = [
  { value: 1, label: '灯光' },
  { value: 2, label: '空调' },
  { value: 3, label: '门锁' },
  { value: 4, label: '窗帘' },
  { value: 5, label: '传感器' },
  { value: 6, label: '咖啡机' }
]

// 设备表单验证规则
const deviceFormRules = {
  deviceName: [
    { required: true, message: '请输入设备名称', trigger: 'blur' }
  ],
  deviceType: [
    { required: true, message: '请选择设备类型', trigger: 'change' }
  ],
  roomId: [
    { required: true, message: '请输入房间ID', trigger: 'blur' }
  ],
  protocol: [
    { required: true, message: '请选择通信协议', trigger: 'change' }
  ]
}

// 计算属性：过滤后的设备列表
const filteredDevices = computed(() => {
  if (!searchKeyword.value) {
    return devices.value
  }
  
  const keyword = searchKeyword.value.toLowerCase()
  return devices.value.filter(device => 
    device.deviceName.toLowerCase().includes(keyword) ||
    device.deviceId.toString().includes(keyword)
  )
})

// 计算属性：分页后的设备列表
const paginatedDevices = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredDevices.value.slice(start, end)
})

// 设备统计
const onlineDevices = computed(() => {
  return devices.value.filter(device => device.status === 1).length
})

const offlineDevices = computed(() => {
  return devices.value.filter(device => device.status === 0).length
})

const totalDevices = computed(() => {
  return devices.value.length
})

const warningDevices = computed(() => {
  // 这里可以根据实际需求定义异常设备的条件
  return 0
})

// 获取设备类型标签类型
const getDeviceTypeTag = (type) => {
  const tagMap = {
    1: 'primary',   // 灯光
    2: 'success',   // 空调
    3: 'warning',   // 门锁
    4: 'info',      // 窗帘
    5: 'danger',    // 传感器
    6: ''           // 咖啡机 - 默认色
  }
  return tagMap[type] || 'info'
}

const getDeviceTypeName = (type) => {
  const nameMap = {
    1: '灯光',
    2: '空调',
    3: '门锁',
    4: '窗帘',
    5: '传感器',
    6: '咖啡机'
  }
  return nameMap[type] || '未知'
}

// 获取所有设备
const fetchDevices = async () => {
  loading.value = true
  try {
    const res = await axios.get('http://localhost:8082/findAll')
    if (res.data.code === 200) {
      devices.value = res.data.data || []
    } else {
      ElMessage.error(res.data.msg || '获取设备列表失败')
    }
  } catch (error) {
    console.error('获取设备列表失败:', error)
    ElMessage.error('获取设备列表失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}

// 刷新设备列表
const refreshDevices = () => {
  ElMessage.info('正在刷新设备列表...')
  fetchDevices()
}

// 显示添加设备对话框
const showAddDeviceDialog = () => {
  editingDevice.value = null
  // 重置表单
  Object.keys(deviceForm).forEach(key => {
    if (key === 'deviceType') {
      deviceForm[key] = 1
    } else if (key === 'roomId') {
      deviceForm[key] = 1
    } else if (key === 'protocol') {
      deviceForm[key] = 'WiFi'
    } else {
      deviceForm[key] = ''
    }
  })
  deviceDialogVisible.value = true
}

// 编辑设备
const editDevice = (device) => {
  editingDevice.value = device
  // 填充表单数据
  Object.keys(deviceForm).forEach(key => {
    deviceForm[key] = device[key]
  })
  deviceDialogVisible.value = true
}

// 控制设备
const controlDevice = (device) => {
  ElMessage.info(`控制设备: ${device.deviceName}`)
  // 这里可以打开设备控制面板
}

// 删除设备
const deleteDevice = async (deviceId) => {
  ElMessageBox.confirm(
    '确定要删除这个设备吗？此操作不可恢复',
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await axios.delete('http://localhost:8082/deleteDevice', {
        params: { deviceId }
      })
      
      if (res.data.code === 200) {
        ElMessage.success('删除成功')
        fetchDevices() // 重新加载设备列表
      } else {
        ElMessage.error(res.data.msg || '删除失败')
      }
    } catch (error) {
      console.error('删除设备失败:', error)
      ElMessage.error('删除设备失败，请检查网络连接')
    }
  }).catch(() => {
    // 用户取消删除
  })
}

// 保存设备（添加或编辑）
const saveDevice = async () => {
  if (!deviceFormRef.value) return
  
  await deviceFormRef.value.validate(async (valid) => {
    if (valid) {
      saveLoading.value = true
      try {
        if (editingDevice.value) {
          // 编辑设备 - 这里简化处理，实际应该调用编辑接口
          ElMessage.info('编辑功能开发中')
        } else {
          // 添加设备
          const res = await axios.post('http://localhost:8082/addDevice', {
            deviceName: deviceForm.deviceName,
            deviceType: deviceForm.deviceType,
            roomId: deviceForm.roomId,
            protocol: deviceForm.protocol
          })
          
          if (res.data.code === 200) {
            ElMessage.success('设备添加成功')
            deviceDialogVisible.value = false
            fetchDevices() // 重新加载设备列表
          } else {
            ElMessage.error(res.data.msg || '添加失败')
          }
        }
      } catch (error) {
        console.error('保存设备失败:', error)
        ElMessage.error('保存设备失败，请检查网络连接')
      } finally {
        saveLoading.value = false
      }
    }
  })
}

// 处理选择变化
const handleSelectionChange = (val) => {
  selectedDevices.value = val
}

// 分页相关方法
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

// 组件挂载时获取设备列表
onMounted(() => {
  fetchDevices()
})
</script>

<style scoped>
.devices-container {
  padding: 20px;
  height: 100%;
  display: flex;
  justify-content: center;
  width: 100%;
}

.devices-content {
  width: 100%;
  max-width: 1400px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.operation-card {
  margin-bottom: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
}

.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-card.online {
  border-left: 3px solid #FF6700;
}

.stat-card.offline {
  border-left: 3px solid #f44336;
}

.stat-card.total {
  border-left: 3px solid #2196F3;
}

.stat-card.warning {
  border-left: 3px solid #FF9800;
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 20px;
}

.stat-icon {
  font-size: 32px;
  margin-right: 15px;
}

.stat-card.online .stat-icon {
  color: #FF6700;
}

.stat-card.offline .stat-icon {
  color: #f44336;
}

.stat-card.total .stat-icon {
  color: #2196F3;
}

.stat-card.warning .stat-icon {
  color: #FF9800;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

/* 设备卡片 */
.devices-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  overflow: hidden;
}

.devices-card :deep(.el-card__body) {
  padding: 0;
}

.device-name-cell {
  display: flex;
  align-items: center;
}

.device-icon {
  margin-right: 8px;
  color: #FF6700;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 20px;
}

/* 对话框样式 */
.device-dialog :deep(.el-dialog) {
  border-radius: 15px;
}

.device-dialog :deep(.el-dialog__header) {
  background: #FF6700;
  color: white;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
}

.device-dialog :deep(.el-dialog__title) {
  color: white;
}

.device-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .devices-content {
    padding: 10px;
  }
  
  .operation-bar {
    flex-direction: column;
    gap: 15px;
  }
  
  .right-actions {
    width: 100%;
  }
  
  .right-actions .el-input {
    width: 100% !important;
  }
}
</style>