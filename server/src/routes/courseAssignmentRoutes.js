const express = require('express');
const { authRequired, requireRole } = require('../middlewares/auth');
const { createAssignment, listAssignments } = require('../controllers/assignmentController');
const { uploadLocal } = require('../utils/storage');

const router = express.Router();

router.get('/:id/assignments', authRequired, listAssignments);
router.post('/:id/assignments', authRequired, requireRole('teacher'), uploadLocal.array('attachments', 5), createAssignment);

module.exports = router;
