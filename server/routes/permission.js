import { Router } from 'express';
import { users, roles, permissions } from '../store/index.js';

const router = Router();

// GET /roles - 获取所有角色列表
router.get('/roles', (req, res) => {
  res.json({ code: 200, data: roles });
});

// GET /permissions - 获取所有权限项
router.get('/permissions', (req, res) => {
  res.json({ code: 200, data: permissions });
});

// GET /userList - 获取所有用户列表（含角色信息）
router.get('/userList', (req, res) => {
  const list = users.map(u => {
    const role = roles.find(r => r.key === u.role) || roles.find(r => r.key === 'viewer');
    return {
      username: u.username,
      nickname: u.nickname,
      email: u.email,
      phone: u.phone,
      isActive: u.isActive,
      role: u.role || 'viewer',
      roleName: role.label,
    };
  });
  res.json({ code: 200, data: list });
});

// PUT /assignRole - 给用户分配角色
router.put('/assignRole', (req, res) => {
  const { username, role } = req.body;

  if (!username || !role) {
    return res.json({ code: 400, msg: '参数不完整' });
  }

  const roleObj = roles.find(r => r.key === role);
  if (!roleObj) {
    return res.json({ code: 400, msg: '角色不存在' });
  }

  const user = users.find(u => u.username === username);
  if (!user) {
    return res.json({ code: 400, msg: '用户不存在' });
  }

  user.role = role;
  res.json({ code: 200, msg: `已将 ${user.nickname || user.username} 的角色设为「${roleObj.label}」` });
});

// PUT /updateUserStatus - 启用/禁用用户
router.put('/updateUserStatus', (req, res) => {
  const { username, isActive } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) {
    return res.json({ code: 400, msg: '用户不存在' });
  }

  user.isActive = isActive;
  res.json({ code: 200, msg: isActive ? '用户已启用' : '用户已禁用' });
});

// GET /userPermissions/:username - 获取指定用户的完整权限信息
router.get('/userPermissions/:username', (req, res) => {
  const { username } = req.params;
  const user = users.find(u => u.username === username);

  if (!user) {
    return res.json({ code: 400, msg: '用户不存在' });
  }

  const role = roles.find(r => r.key === (user.role || 'viewer'));
  const userPermissions = role ? role.permissions : [];

  res.json({
    code: 200,
    data: {
      username: user.username,
      nickname: user.nickname,
      role: user.role || 'viewer',
      roleName: role ? role.label : '观察者',
      permissions: userPermissions,
    }
  });
});

// DELETE /deleteUser - 删除用户
router.delete('/deleteUser', (req, res) => {
  const { username } = req.query;

  if (username === 'admin') {
    return res.json({ code: 400, msg: '不能删除超级管理员' });
  }

  const index = users.findIndex(u => u.username === username);
  if (index === -1) {
    return res.json({ code: 400, msg: '用户不存在' });
  }

  users.splice(index, 1);
  res.json({ code: 200, msg: '用户已删除' });
});

export default router;
