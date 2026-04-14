import { Router } from 'express';
import { devices, nextDeviceId } from '../store/index.js';

const router = Router();

// GET /findAll
router.get('/findAll', (req, res) => {
  res.json({ code: 200, data: devices });
});

// POST /addDevice
router.post('/addDevice', (req, res) => {
  const { deviceName, deviceType, roomId, protocol } = req.body;

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const createdTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  devices.push({
    deviceId: nextDeviceId(),
    deviceName,
    deviceType,
    roomId,
    status: 1,
    protocol,
    createdTime
  });

  res.json({ code: 200, msg: '添加成功' });
});

// DELETE /deleteDevice
router.delete('/deleteDevice', (req, res) => {
  const deviceId = Number(req.query.deviceId);
  const index = devices.findIndex(d => d.deviceId === deviceId);

  if (index === -1) {
    return res.json({ code: 400, msg: '设备不存在' });
  }

  devices.splice(index, 1);
  res.json({ code: 200, msg: '删除成功' });
});

export default router;
