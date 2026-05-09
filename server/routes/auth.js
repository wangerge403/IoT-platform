import { Router } from 'express';
import { users, roles } from '../store/index.js';

const router = Router();

// GET /login
router.get('/login', (req, res) => {
  const { username, password } = req.query;
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    const role = roles.find(r => r.key === user.role) || roles.find(r => r.key === 'viewer');
    res.json({
      code: 200,
      msg: '登录成功',
      data: {
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        phone: user.phone,
        role: user.role || 'viewer',
        roleName: role.label,
        token: Math.random().toString(36)
      }
    });
  } else {
    res.json({ code: 400, msg: '用户名或密码错误' });
  }
});

// POST /register
router.post('/register', (req, res) => {
  const { username, nickname, password, email, phone, isActive } = req.body;
  const exists = users.find(u => u.username === username);

  if (exists) {
    return res.json({ code: 400, msg: '用户名已存在' });
  }

  users.push({ username, nickname, password, email, phone, isActive, role: 'viewer' });
  res.json({ code: 200, msg: '注册成功' });
});

export default router;
