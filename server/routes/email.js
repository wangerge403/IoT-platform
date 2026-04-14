import { Router } from 'express';
import { users, codes } from '../store/index.js';

const router = Router();

// GET /sendEmail
router.get('/sendEmail', (req, res) => {
  const { toEmail } = req.query;

  if (!toEmail) {
    return res.json({ code: 400, msg: '邮箱地址不能为空' });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  codes.set(toEmail, code);
  console.log(`[验证码] ${toEmail}: ${code}`);

  res.json({ code: 200, msg: '验证码已发送' });
});

// PUT /updatePassword
router.put('/updatePassword', (req, res) => {
  const { code, password, email } = req.query;

  const storedCode = codes.get(email);
  if (!storedCode || storedCode !== code) {
    return res.json({ code: 400, msg: '验证码错误或已过期' });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.json({ code: 400, msg: '该邮箱未注册' });
  }

  user.password = password;
  codes.delete(email);

  res.json({ code: 200, msg: '密码重置成功' });
});

export default router;
