// 内存数据存储模块

// ==================== 权限定义 ====================
// 所有可分配的权限项
export const permissions = [
  { key: 'dashboard:view', label: '查看首页', module: '首页' },
  { key: 'device:view',    label: '查看设备', module: '设备管理' },
  { key: 'device:add',     label: '添加设备', module: '设备管理' },
  { key: 'device:edit',    label: '编辑设备', module: '设备管理' },
  { key: 'device:delete',  label: '删除设备', module: '设备管理' },
  { key: 'device:control', label: '控制设备', module: '设备管理' },
  { key: 'alarm:view',     label: '查看报警', module: '报警信息' },
  { key: 'alarm:handle',   label: '处理报警', module: '报警信息' },
  { key: 'analytics:view', label: '查看分析', module: '数据分析' },
  { key: 'user:view',      label: '查看用户', module: '用户管理' },
  { key: 'user:add',       label: '添加用户', module: '用户管理' },
  { key: 'user:edit',      label: '编辑用户', module: '用户管理' },
  { key: 'user:delete',    label: '删除用户', module: '用户管理' },
  { key: 'permission:manage', label: '管理权限', module: '权限管理' },
  { key: 'settings:view',  label: '查看设置', module: '系统设置' },
  { key: 'settings:edit',  label: '修改设置', module: '系统设置' },
];

// 角色定义及默认权限
export const roles = [
  {
    key: 'admin',
    label: '超级管理员',
    description: '拥有系统所有权限，可管理用户和分配角色',
    permissions: permissions.map(p => p.key), // 全部权限
  },
  {
    key: 'operator',
    label: '操作员',
    description: '可管理设备、处理报警、查看数据分析',
    permissions: [
      'dashboard:view',
      'device:view', 'device:add', 'device:edit', 'device:delete', 'device:control',
      'alarm:view', 'alarm:handle',
      'analytics:view',
      'settings:view',
    ],
  },
  {
    key: 'viewer',
    label: '观察者',
    description: '只读权限，可查看首页、设备、报警和分析数据',
    permissions: [
      'dashboard:view',
      'device:view',
      'alarm:view',
      'analytics:view',
      'settings:view',
    ],
  },
];

// 用户数据，预置默认管理员
export const users = [
  {
    username: 'admin',
    nickname: '管理员',
    password: '123456',
    email: 'admin@example.com',
    phone: '13800000000',
    isActive: true,
    role: 'admin',
  }
];

// 设备数据，预置 3 条示例设备
export const devices = [
  { deviceId: 1, deviceName: '客厅吸顶灯', deviceType: 1, roomId: 1, status: 1, protocol: 'WiFi', createdTime: '2025-01-01 10:00:00' },
  { deviceId: 2, deviceName: '主卧空调', deviceType: 2, roomId: 2, status: 1, protocol: 'MQTT', createdTime: '2025-01-01 10:05:00' },
  { deviceId: 3, deviceName: '前门智能锁', deviceType: 3, roomId: 1, status: 0, protocol: 'ZigBee', createdTime: '2025-01-01 10:10:00' },
  { deviceId: 4, deviceName: '厨房咖啡机', deviceType: 6, roomId: 3, status: 1, protocol: 'WiFi', createdTime: '2025-01-15 09:00:00' }
];

// 验证码存储（email -> code）
export const codes = new Map();

// 设备 ID 自增计数器
let _nextDeviceId = 5;

export function nextDeviceId() {
  return _nextDeviceId++;
}
