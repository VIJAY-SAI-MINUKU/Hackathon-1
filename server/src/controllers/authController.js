const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult, body } = require('express-validator');
const User = require('../models/User');

const registerValidators = [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('role').isIn(['student', 'teacher']),
];

const loginValidators = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

async function register(req, res, next) {
  await Promise.all(registerValidators.map((v) => v.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(Object.assign(new Error('Validation error'), { status: 400, details: errors.array() }));

  const { name, email, password, role } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return next(Object.assign(new Error('Email already in use'), { status: 409 }));
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role });
    const token = jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    next(e);
  }
}

async function login(req, res, next) {
  await Promise.all(loginValidators.map((v) => v.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(Object.assign(new Error('Validation error'), { status: 400, details: errors.array() }));

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return next(Object.assign(new Error('Invalid credentials'), { status: 401 }));
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return next(Object.assign(new Error('Invalid credentials'), { status: 401 }));
    const token = jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    next(e);
  }
}

module.exports = { register, login };
