const express = require('express');
const { authRequired, requireRole } = require('../middlewares/auth');
const {
  listCourses,
  getCourse,
  createCourse,
  enrollInCourse,
  listEnrollments,
} = require('../controllers/courseController');

const { createAssignment, listAssignments } = require('../controllers/assignmentController');
const { uploadLocal } = require('../utils/storage');

const router = express.Router();

router.get('/', authRequired, listCourses);
router.get('/:id', authRequired, getCourse);
router.post('/', authRequired, requireRole('teacher'), createCourse);
router.post('/:id/enroll', authRequired, requireRole('student'), enrollInCourse);
router.get('/:id/enrollments', authRequired, requireRole('teacher'), listEnrollments);

// Nested assignment routes to match API contract
router.get('/:id/assignments', authRequired, listAssignments);
router.post('/:id/assignments', authRequired, requireRole('teacher'), uploadLocal.array('attachments', 5), createAssignment);

module.exports = router;
