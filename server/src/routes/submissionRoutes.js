const express = require('express');
const { authRequired, requireRole } = require('../middlewares/auth');
const { gradeSubmission } = require('../controllers/submissionController');

const router = express.Router();

router.post('/:id/grade', authRequired, requireRole('teacher'), gradeSubmission);

module.exports = router;
