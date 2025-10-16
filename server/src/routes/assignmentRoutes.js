const express = require('express');
const { authRequired, requireRole } = require('../middlewares/auth');
const { submitAssignment, listSubmissions } = require('../controllers/assignmentController');
const { uploadLocal } = require('../utils/storage');

const router = express.Router();

router.post('/:id/submit', authRequired, requireRole('student'), uploadLocal.array('files', 5), submitAssignment);
router.get('/:id/submissions', authRequired, requireRole('teacher'), listSubmissions);

module.exports = router;
