const express = require('express');
const { register, login } = require('../controllers/authController');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

module.exports = router;
