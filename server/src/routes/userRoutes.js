const express = require('express');
const { authRequired } = require('../middlewares/auth');
const { getUserGrades } = require('../controllers/userController');

const router = express.Router();

router.get('/:id/grades', authRequired, getUserGrades);

module.exports = router;
