// 内存数据存储模块

// 用户数据，预置默认管理员
export const users = [
  {
    username: 'admin',
    nickname: '管理员',
    password: '123456',
    email: 'admin@example.com',
    phone: '13800000000',
    isActive: true
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
