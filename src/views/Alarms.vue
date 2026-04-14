<template>
  <div class="alarms-page">
    <div class="page-header">
      <div class="header-info">
        <h2>报警信息</h2>
        <p>查看和管理系统报警记录</p>
      </div>
      <div class="header-actions">
        <el-radio-group v-model="filterLevel" size="small">
          <el-radio-button label="全部" />
          <el-radio-button label="紧急" />
          <el-radio-button label="一般" />
          <el-radio-button label="提示" />
        </el-radio-group>
        <el-button type="primary" size="small" @click="markAllRead">
          <el-icon><Check /></el-icon> 全部已读
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <div class="stat-card" @click="filterLevel = '紧急'">
          <div class="stat-icon-wrap danger-bg">
            <el-icon :size="22"><WarningFilled /></el-icon>
          </div>
          <div class="stat-body">
            <div class="stat-num">{{ urgentCount }}</div>
            <div class="stat-label">紧急报警</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card" @click="filterLevel = '一般'">
          <div class="stat-icon-wrap warning-bg">
            <el-icon :size="22"><Bell /></el-icon>
          </div>
          <div class="stat-body">
            <div class="stat-num">{{ warningCount }}</div>
            <div class="stat-label">一般报警</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card" @click="filterLevel = '提示'">
          <div class="stat-icon-wrap info-bg">
            <el-icon :size="22"><InfoFilled /></el-icon>
          </div>
          <div class="stat-body">
            <div class="stat-num">{{ infoCount }}</div>
            <div class="stat-label">提示信息</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card" @click="filterLevel = '全部'">
          <div class="stat-icon-wrap success-bg">
            <el-icon :size="22"><CircleCheckFilled /></el-icon>
          </div>
          <div class="stat-body">
            <div class="stat-num">{{ resolvedCount }}</div>
            <div class="stat-label">已处理</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 报警列表 -->
    <div class="alarm-list">
      <div
        v-for="item in filteredAlarms"
        :key="item.id"
        class="alarm-item"
        :class="{ resolved: item.status === '已处理' }"
      >
        <div class="alarm-left">
          <div class="level-dot" :class="levelClass(item.level)"></div>
          <div class="alarm-info">
            <div class="alarm-title">
              <span class="alarm-device">{{ item.device }}</span>
              <el-tag :type="levelTag(item.level)" size="small" effect="plain">{{ item.level }}</el-tag>
            </div>
            <div class="alarm-msg">{{ item.message }}</div>
            <div class="alarm-time">
              <el-icon><Clock /></el-icon> {{ item.time }}
            </div>
          </div>
        </div>
        <div class="alarm-right">
          <el-button
            v-if="item.status === '未处理'"
            type="primary"
            size="small"
            round
            @click="resolve(item)"
          >处理</el-button>
          <el-tag v-else type="success" size="small" effect="plain">
            <el-icon><Check /></el-icon> 已处理
          </el-tag>
        </div>
      </div>
      <el-empty v-if="filteredAlarms.length === 0" description="暂无报警记录" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const filterLevel = ref('全部')

const alarms = ref([
  { id: 1, time: '2025-04-14 08:30:12', device: '客厅烟雾传感器', message: '检测到烟雾浓度超标，请立即检查', level: '紧急', status: '未处理' },
  { id: 2, time: '2025-04-14 07:15:00', device: '主卧温湿度传感器', message: '温度超过设定阈值 35°C', level: '一般', status: '未处理' },
  { id: 3, time: '2025-04-13 22:10:33', device: '前门智能锁', message: '连续3次密码输入错误，已临时锁定', level: '紧急', status: '已处理' },
  { id: 4, time: '2025-04-13 18:45:20', device: '厨房咖啡机', message: '水箱水位过低，请及时补水', level: '提示', status: '未处理' },
  { id: 5, time: '2025-04-13 14:20:05', device: '客厅吸顶灯', message: '设备离线超过30分钟', level: '一般', status: '已处理' },
  { id: 6, time: '2025-04-12 09:00:00', device: '主卧空调', message: '滤网需要清洗，已运行超过500小时', level: '提示', status: '已处理' },
])

const filteredAlarms = computed(() => {
  if (filterLevel.value === '全部') return alarms.value
  return alarms.value.filter(a => a.level === filterLevel.value)
})

const urgentCount = computed(() => alarms.value.filter(a => a.level === '紧急' && a.status === '未处理').length)
const warningCount = computed(() => alarms.value.filter(a => a.level === '一般' && a.status === '未处理').length)
const infoCount = computed(() => alarms.value.filter(a => a.level === '提示' && a.status === '未处理').length)
const resolvedCount = computed(() => alarms.value.filter(a => a.status === '已处理').length)

const levelTag = (level) => ({ '紧急': 'danger', '一般': 'warning', '提示': 'info' }[level] || 'info')
const levelClass = (level) => ({ '紧急': 'dot-danger', '一般': 'dot-warning', '提示': 'dot-info' }[level] || 'dot-info')

const resolve = (row) => {
  row.status = '已处理'
  ElMessage.success(`报警 #${row.id} 已处理`)
}

const markAllRead = () => {
  alarms.value.forEach(a => { a.status = '已处理' })
  ElMessage.success('全部标记为已处理')
}
</script>

<style scoped>
.alarms-page {
  padding: 20px;
  width: 100%;
  max-width: 1200px;
}

/* 页头 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
}
.header-info h2 {
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 600;
  color: #333;
}
.header-info p {
  margin: 0;
  color: #999;
  font-size: 14px;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.header-actions :deep(.el-radio-button__inner) {
  border-radius: 6px !important;
}
.header-actions :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #FF6700;
  border-color: #FF6700;
}
.header-actions .el-button--primary {
  background: #FF6700;
  border-color: #FF6700;
}
.header-actions .el-button--primary:hover {
  background: #ff8533;
  border-color: #ff8533;
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 20px;
}
.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}
.stat-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
.danger-bg { background: #f44336; }
.warning-bg { background: #FF9800; }
.info-bg { background: #2196F3; }
.success-bg { background: #4CAF50; }
.stat-body { flex: 1; }
.stat-num {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  line-height: 1;
}
.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

/* 报警列表 */
.alarm-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.alarm-item {
  background: #fff;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #f0f0f0;
  transition: all 0.2s;
}
.alarm-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}
.alarm-item.resolved {
  opacity: 0.6;
}
.alarm-left {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  flex: 1;
}
.level-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}
.dot-danger { background: #f44336; box-shadow: 0 0 6px rgba(244, 67, 54, 0.4); }
.dot-warning { background: #FF9800; box-shadow: 0 0 6px rgba(255, 152, 0, 0.4); }
.dot-info { background: #2196F3; box-shadow: 0 0 6px rgba(33, 150, 243, 0.4); }
.alarm-info { flex: 1; }
.alarm-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.alarm-device {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}
.alarm-msg {
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}
.alarm-time {
  font-size: 12px;
  color: #bbb;
  display: flex;
  align-items: center;
  gap: 4px;
}
.alarm-right {
  flex-shrink: 0;
  margin-left: 16px;
}
.alarm-right .el-button--primary {
  background: #FF6700;
  border-color: #FF6700;
}
.alarm-right .el-button--primary:hover {
  background: #ff8533;
  border-color: #ff8533;
}
</style>
