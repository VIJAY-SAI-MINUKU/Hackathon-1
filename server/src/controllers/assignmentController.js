const { validationResult, body, param } = require('express-validator');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Enrollment = require('../models/Enrollment');
const Submission = require('../models/Submission');

const courseIdParam = [param('id').isMongoId()];
const assignmentIdParam = [param('id').isMongoId()];

const createAssignmentValidators = [
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('dueDate').isISO8601(),
];

async function createAssignment(req, res, next) {
  await Promise.all([...courseIdParam, ...createAssignmentValidators].map((v) => v.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(Object.assign(new Error('Validation error'), { status: 400, details: errors.array() }));
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return next(Object.assign(new Error('Course not found'), { status: 404 }));
    if (course.teacherId.toString() !== req.user.id) return next(Object.assign(new Error('Forbidden'), { status: 403 }));

    const attachments = Array.isArray(req.files)
      ? req.files.map((f) => ({ filename: f.originalname, url: `/uploads/${f.filename}` }))
      : [];

    const assignment = await Assignment.create({
      courseId: course._id,
      title: req.body.title,
      description: req.body.description,
      dueDate: new Date(req.body.dueDate),
      attachments,
    });
    res.status(201).json(assignment);
  } catch (e) {
    next(e);
  }
}

async function listAssignments(req, res, next) {
  await Promise.all(courseIdParam.map((v) => v.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(Object.assign(new Error('Validation error'), { status: 400 }));
  try {
    const assignments = await Assignment.find({ courseId: req.params.id }).sort({ createdAt: -1 });
    res.json(assignments);
  } catch (e) {
    next(e);
  }
}

async function submitAssignment(req, res, next) {
  await Promise.all(assignmentIdParam.map((v) => v.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(Object.assign(new Error('Validation error'), { status: 400 }));
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return next(Object.assign(new Error('Assignment not found'), { status: 404 }));

    const enrolled = await Enrollment.findOne({ courseId: assignment.courseId, studentId: req.user.id });
    if (!enrolled) return next(Object.assign(new Error('Not enrolled in this course'), { status: 403 }));

    const files = Array.isArray(req.files)
      ? req.files.map((f) => ({ filename: f.originalname, url: `/uploads/${f.filename}` }))
      : [];

    try {
      const submission = await Submission.create({
        assignmentId: assignment._id,
        studentId: req.user.id,
        files,
        text: req.body.text,
      });
      res.status(201).json(submission);
    } catch (err) {
      if (err && err.code === 11000) {
        return next(Object.assign(new Error('Already submitted'), { status: 409 }));
      }
      throw err;
    }
  } catch (e) {
    next(e);
  }
}

async function listSubmissions(req, res, next) {
  await Promise.all(assignmentIdParam.map((v) => v.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(Object.assign(new Error('Validation error'), { status: 400 }));
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return next(Object.assign(new Error('Assignment not found'), { status: 404 }));

    const course = await Course.findById(assignment.courseId);
    if (!course) return next(Object.assign(new Error('Course not found'), { status: 404 }));
    if (course.teacherId.toString() !== req.user.id) return next(Object.assign(new Error('Forbidden'), { status: 403 }));

    const submissions = await Submission.find({ assignmentId: assignment._id })
      .populate('studentId', 'name email');

    res.json(submissions);
  } catch (e) {
    next(e);
  }
}

module.exports = { createAssignment, listAssignments, submitAssignment, listSubmissions };
