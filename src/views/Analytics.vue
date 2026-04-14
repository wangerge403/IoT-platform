<template>
  <div class="analytics-container">
    <div class="page-header">
      <h2>数据分析</h2>
      <p>设备运行数据统计与趋势分析</p>
    </div>

    <el-row :gutter="16" class="stats-row">
      <el-col :span="6" v-for="item in summaryCards" :key="item.label">
        <div class="stat-card">
          <div class="stat-num">{{ item.value }}</div>
          <div class="stat-label">{{ item.label }}</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="charts-row">
      <el-col :span="16">
        <el-card class="chart-card">
          <template #header><span>设备在线趋势（近7天）</span></template>
          <div ref="trendChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="chart-card">
          <template #header><span>报警类型分布</span></template>
          <div ref="alarmPieRef" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header><span>设备类型占比</span></template>
          <div ref="devicePieRef" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header><span>每日能耗统计（kWh）</span></template>
          <div ref="energyChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

const summaryCards = ref([
  { label: '总设备数', value: 25 },
  { label: '在线率', value: '88%' },
  { label: '今日报警', value: 3 },
  { label: '今日能耗', value: '42 kWh' },
])

const trendChartRef = ref(null)
const alarmPieRef = ref(null)
const devicePieRef = ref(null)
const energyChartRef = ref(null)
let charts = []

const initCharts = () => {
  // 在线趋势
  const trend = echarts.init(trendChartRef.value)
  trend.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: ['周一','周二','周三','周四','周五','周六','周日'] },
    yAxis: { type: 'value' },
    series: [
      { name: '在线', type: 'line', smooth: true, data: [18,20,19,22,21,23,22], areaStyle: { color: 'rgba(255,103,0,0.1)' }, lineStyle: { color: '#FF6700' }, itemStyle: { color: '#FF6700' } },
      { name: '离线', type: 'line', smooth: true, data: [7,5,6,3,4,2,3], lineStyle: { color: '#ccc' }, itemStyle: { color: '#ccc' } }
    ]
  })
  charts.push(trend)

  // 报警饼图
  const alarmPie = echarts.init(alarmPieRef.value)
  alarmPie.setOption({
    tooltip: { trigger: 'item' },
    series: [{ type: 'pie', radius: ['40%','70%'], data: [
      { value: 5, name: '紧急', itemStyle: { color: '#f44336' } },
      { value: 8, name: '一般', itemStyle: { color: '#FF9800' } },
      { value: 12, name: '提示', itemStyle: { color: '#2196F3' } }
    ]}]
  })
  charts.push(alarmPie)

  // 设备类型饼图
  const devicePie = echarts.init(devicePieRef.value)
  devicePie.setOption({
    tooltip: { trigger: 'item' },
    series: [{ type: 'pie', radius: '65%', data: [
      { value: 8, name: '灯光' }, { value: 3, name: '空调' }, { value: 2, name: '门锁' },
      { value: 2, name: '窗帘' }, { value: 9, name: '传感器' }, { value: 1, name: '咖啡机' }
    ]}]
  })
  charts.push(devicePie)

  // 能耗柱状图
  const energy = echarts.init(energyChartRef.value)
  energy.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: ['周一','周二','周三','周四','周五','周六','周日'] },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: [38,42,35,48,40,45,42], itemStyle: { color: '#FF6700', borderRadius: [4,4,0,0] } }]
  })
  charts.push(energy)
}

const handleResize = () => { charts.forEach(c => c.resize()) }

onMounted(() => { initCharts(); window.addEventListener('resize', handleResize) })
onBeforeUnmount(() => { window.removeEventListener('resize', handleResize); charts.forEach(c => c.dispose()) })
</script>

<style scoped>
.analytics-container { padding: 20px; width: 100%; }
.page-header { margin-bottom: 20px; }
.page-header h2 { margin: 0 0 8px; font-size: 22px; font-weight: 600; color: #333; }
.page-header p { margin: 0; color: #999; font-size: 14px; }

.stats-row { margin-bottom: 20px; }
.stat-card {
  background: #fff; border-radius: 12px; padding: 20px; text-align: center;
  border: 1px solid #f0f0f0;
}
.stat-num { font-size: 28px; font-weight: 700; color: #FF6700; }
.stat-label { font-size: 13px; color: #999; margin-top: 4px; }

.charts-row { margin-bottom: 16px; }
.chart-card { border-radius: 12px; border: 1px solid #f0f0f0; margin-bottom: 16px; }
.chart-box { height: 300px; width: 100%; }
</style>
