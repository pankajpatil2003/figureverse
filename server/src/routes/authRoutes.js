const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../config/db');
const { signToken, requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, phone } = req.body || {};
    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    const existing = await db.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    const password_hash = bcrypt.hashSync(String(password), 10);
    const user = await db.createUser({
      full_name: String(full_name).trim(),
      email: String(email).trim().toLowerCase(),
      password_hash,
      phone: String(phone || '').trim(),
      role: 'customer'
    });
    const token = signToken(user);
    return res.status(201).json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const user = await db.findUserByEmail(email);
    if (!user || !bcrypt.compareSync(String(password), user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const token = signToken(user);
    return res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json({
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/orders', requireAuth, async (req, res) => {
  try {
    const orders = await db.getOrdersForUser(req.user.id, req.user.email);
    return res.json({ orders });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
