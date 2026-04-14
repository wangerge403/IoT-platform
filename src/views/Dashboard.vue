<template>
  <div class="dashboard-container">
    <div class="dashboard-content">
      <!-- 顶部欢迎卡片 -->
      <el-row :gutter="20" class="welcome-row">
        <el-col :span="24">
          <div class="welcome-card">
            <div class="welcome-content">
              <div class="welcome-text">
                <h2>欢迎回来, {{ user?.nickname || user?.username }}!</h2>
                <p>今天是 {{ currentDate }}，祝您工作愉快！</p>
              </div>
              <div class="weather-info">
                <el-icon><Sunny /></el-icon>
                <span>晴天 25°C</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
      
      <!-- 统计卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <div class="stat-card online">
            <div class="stat-icon">
              <el-icon><Monitor /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.onlineDevices }}</div>
              <div class="stat-label">在线设备</div>
            </div>
            <div class="stat-trend">
              <el-icon class="trend-up"><Top /></el-icon>
              <span>+12%</span>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="stat-card total">
            <div class="stat-icon">
              <el-icon><Monitor /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalDevices }}</div>
              <div class="stat-label">总设备数</div>
            </div>
            <div class="stat-trend">
              <el-icon class="trend-up"><Top /></el-icon>
              <span>+5%</span>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="stat-card rooms">
            <div class="stat-icon">
              <el-icon><HomeFilled /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.rooms }}</div>
              <div class="stat-label">房间数</div>
            </div>
            <div class="stat-trend">
              <el-icon class="trend-down"><Bottom /></el-icon>
              <span>-2%</span>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="stat-card alarms">
            <div class="stat-icon">
              <el-icon><Bell /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.alarms }}</div>
              <div class="stat-label">报警信息</div>
            </div>
            <div class="stat-trend">
              <el-icon class="trend-down"><Bottom /></el-icon>
              <span>-8%</span>
            </div>
          </div>
        </el-col>
      </el-row>
      
      <!-- 图表区域 -->
      <el-row :gutter="20" class="charts-row">
        <el-col :span="16">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>设备状态统计</span>
                <el-dropdown trigger="click">
                  <el-button link>
                    最近7天<el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item>今天</el-dropdown-item>
                      <el-dropdown-item>最近7天</el-dropdown-item>
                      <el-dropdown-item>最近30天</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
            <div class="chart-container">
              <div ref="statusChartRef" class="chart-wrapper"></div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>设备类型分布</span>
              </div>
            </template>
            <div class="chart-container">
              <div ref="typeChartRef" class="chart-wrapper"></div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 快捷操作和最近活动 -->
      <el-row :gutter="20" class="activity-row">
        <el-col :span="8">
          <el-card class="quick-actions-card">
            <template #header>
              <div class="card-header">
                <span>快捷操作</span>
              </div>
            </template>
            <div class="quick-actions">
              <div 
                class="action-item" 
                v-for="(action, index) in quickActions" 
                :key="index"
                @click="handleQuickAction(action)"
              >
                <div class="action-icon" :style="{ backgroundColor: action.color }">
                  <el-icon>{{ action.icon }}</el-icon>
                </div>
                <div class="action-text">{{ action.name }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="16">
          <el-card class="activity-card">
            <template #header>
              <div class="card-header">
                <span>最近活动</span>
              </div>
            </template>
            <el-table :data="recentActivities" style="width: 100%">
              <el-table-column prop="time" label="时间" width="180">
                <template #default="scope">
                  <span class="time-text">{{ scope.row.time }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="user" label="用户" width="120" />
              <el-table-column prop="action" label="操作" />
              <el-table-column prop="device" label="设备" width="150" />
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

// 获取用户信息
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))

// 当前日期
const currentDate = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const dayOfWeek = days[now.getDay()]
  return `${year}年${month}月${day}日 ${dayOfWeek}`
})

// 统计数据
const stats = ref({
  onlineDevices: 12,
  totalDevices: 25,
  rooms: 5,
  alarms: 2
})

// 快捷操作
const quickActions = ref([
  { name: '查看报警', icon: 'Bell', color: '#e6a23c' },
  { name: '系统设置', icon: 'Setting', color: '#f56c6c' }
])

// 最近活动数据
const recentActivities = ref([
  {
    time: '2023-10-01 14:30:22',
    user: '管理员',
    action: '开启客厅空调',
    device: '客厅空调'
  },
  {
    time: '2023-10-01 13:45:10',
    user: '用户A',
    action: '关闭主卧灯光',
    device: '主卧吸顶灯'
  },
  {
    time: '2023-10-01 12:20:05',
    user: '管理员',
    action: '设置观影模式',
    device: '客厅设备组'
  },
  {
    time: '2023-10-01 11:15:30',
    user: '系统',
    action: '检测到烟雾报警',
    device: '客厅烟雾传感器'
  },
  {
    time: '2023-10-01 10:30:15',
    user: '用户B',
    action: '打开次卧窗帘',
    device: '次卧窗帘电机'
  }
])

// 图表引用
const statusChartRef = ref(null)
const typeChartRef = ref(null)
let statusChart = null
let typeChart = null

// 处理快捷操作
const handleQuickAction = (action) => {
  ElMessage.info(`执行操作: ${action.name}`)
}

// 初始化图表
const initCharts = () => {
  // 设备状态统计图
  if (statusChartRef.value) {
    statusChart = echarts.init(statusChartRef.value)
    const statusOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
          axisTick: {
            alignWithLabel: true
          }
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: [
        {
          name: '在线设备',
          type: 'bar',
          barWidth: '60%',
          data: [10, 12, 11, 13, 12, 14, 12],
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#2378f7' },
                { offset: 0.7, color: '#2378f7' },
                { offset: 1, color: '#83bff6' }
              ])
            }
          }
        }
      ]
    }
    statusChart.setOption(statusOption)
  }
  
  // 设备类型分布图
  if (typeChartRef.value) {
    typeChart = echarts.init(typeChartRef.value)
    const typeOption = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        bottom: '0',
        left: 'center'
      },
      series: [
        {
          name: '设备类型',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 8, name: '灯光' },
            { value: 3, name: '空调' },
            { value: 2, name: '门锁' },
            { value: 2, name: '窗帘' },
            { value: 10, name: '传感器' }
          ]
        }
      ]
    }
    typeChart.setOption(typeOption)
  }
}

// 窗口大小改变时重置图表
const handleResize = () => {
  if (statusChart) {
    statusChart.resize()
  }
  if (typeChart) {
    typeChart.resize()
  }
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (statusChart) {
    statusChart.dispose()
  }
  if (typeChart) {
    typeChart.dispose()
  }
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  height: 100%;
  display: flex;
  justify-content: center;
  width: 100%;
}

.dashboard-content {
  width: 100%;
  max-width: 1400px;
}

/* 欢迎卡片 */
.welcome-row {
  margin-bottom: 20px;
}

.welcome-card {
  background: linear-gradient(135deg, #FF6700 0%, #ff8533 100%);
  border-radius: 12px;
  padding: 24px;
  color: white;
  box-shadow: 0 4px 12px rgba(255, 103, 0, 0.2);
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-text h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: 600;
}

.welcome-text p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

.weather-info {
  display: flex;
  align-items: center;
  font-size: 18px;
}

.weather-info .el-icon {
  margin-right: 8px;
  font-size: 24px;
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
}

.stat-card.online::before {
  background: #FF6700;
}

.stat-card.total::before {
  background: #2196F3;
}

.stat-card.rooms::before {
  background: #4CAF50;
}

.stat-card.alarms::before {
  background: #f44336;
}

.stat-card .stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  font-size: 24px;
}

.stat-card.online .stat-icon {
  background: rgba(255, 103, 0, 0.1);
  color: #FF6700;
}

.stat-card.total .stat-icon {
  background: rgba(33, 150, 243, 0.1);
  color: #2196F3;
}

.stat-card.rooms .stat-icon {
  background: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
}

.stat-card.alarms .stat-icon {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.stat-content {
  margin-bottom: 15px;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.stat-trend {
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 500;
}

.stat-trend .trend-up {
  color: #67c23a;
  margin-right: 3px;
}

.stat-trend .trend-down {
  color: #f56c6c;
  margin-right: 3px;
}

/* 图表卡片 */
.charts-row {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  overflow: hidden;
}

.chart-card :deep(.el-card__header) {
  background: rgba(245, 247, 250, 0.8);
  border-bottom: 1px solid #ebeef5;
  padding: 15px 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.chart-container {
  height: 300px;
}

.chart-wrapper {
  width: 100%;
  height: 100%;
}

/* 快捷操作 */
.quick-actions-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  height: 100%;
}

.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 10px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  border-radius: 12px;
  background: #f5f7fa;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-item:hover {
  background: #FFF3E0;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.action-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  color: white;
  font-size: 18px;
}

.action-text {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

/* 活动卡片 */
.activity-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  height: 100%;
}

.time-text {
  color: #909399;
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-content {
    padding: 10px;
  }
  
  .welcome-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .weather-info {
    margin-top: 15px;
  }
  
  .stats-row {
    flex-direction: column;
  }
  
  .stat-card {
    margin-bottom: 15px;
  }
  
  .charts-row,
  .activity-row {
    flex-direction: column;
  }
  
  .quick-actions {
    grid-template-columns: 1fr;
  }
}
</style>