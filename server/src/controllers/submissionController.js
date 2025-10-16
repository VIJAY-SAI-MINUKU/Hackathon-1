const { validationResult, body, param } = require('express-validator');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');

const submissionIdParam = [param('id').isMongoId()];
const gradeValidators = [
  body('score').isFloat({ min: 0 }),
  body('maxScore').isFloat({ min: 1 }),
  body('feedback').optional().isString().isLength({ max: 2000 }),
];

async function gradeSubmission(req, res, next) {
  await Promise.all([...submissionIdParam, ...gradeValidators].map((v) => v.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(Object.assign(new Error('Validation error'), { status: 400, details: errors.array() }));

  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return next(Object.assign(new Error('Submission not found'), { status: 404 }));

    const assignment = await Assignment.findById(submission.assignmentId);
    if (!assignment) return next(Object.assign(new Error('Assignment not found'), { status: 404 }));

    const course = await Course.findById(assignment.courseId);
    if (!course) return next(Object.assign(new Error('Course not found'), { status: 404 }));

    if (course.teacherId.toString() !== req.user.id) return next(Object.assign(new Error('Forbidden'), { status: 403 }));

    submission.grade = { score: req.body.score, maxScore: req.body.maxScore };
    submission.feedback = req.body.feedback;

    await submission.save();

    res.json(submission);
  } catch (e) {
    next(e);
  }
}

module.exports = { gradeSubmission };
