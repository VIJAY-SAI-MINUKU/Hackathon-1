const { validationResult, body, param } = require('express-validator');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

const createCourseValidators = [
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('duration').trim().notEmpty(),
];

const idParam = [param('id').isMongoId()];

async function listCourses(req, res, next) {
  try {
    const { enrolled } = req.query;
    if (enrolled === 'true') {
      const enrollments = await Enrollment.find({ studentId: req.user.id });
      const courseIds = enrollments.map((en) => en.courseId);
      const courses = await Course.find({ _id: { $in: courseIds } }).sort({ createdAt: -1 });
      return res.json(courses);
    }
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (e) {
    next(e);
  }
}

async function getCourse(req, res, next) {
  await Promise.all(idParam.map((v) => v.run(req)));
  const errors = (await validationResult(req));
  if (!errors.isEmpty()) return next(Object.assign(new Error('Validation error'), { status: 400 }));
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return next(Object.assign(new Error('Course not found'), { status: 404 }));
    res.json(course);
  } catch (e) {
    next(e);
  }
}

async function createCourse(req, res, next) {
  await Promise.all(createCourseValidators.map((v) => v.run(req)));
  const errors = (await validationResult(req));
  if (!errors.isEmpty()) return next(Object.assign(new Error('Validation error'), { status: 400 }));
  try {
    const course = await Course.create({
      title: req.body.title,
      description: req.body.description,
      duration: req.body.duration,
      teacherId: req.user.id,
    });
    res.status(201).json(course);
  } catch (e) {
    next(e);
  }
}

async function enrollInCourse(req, res, next) {
  await Promise.all(idParam.map((v) => v.run(req)));
  const errors = (await validationResult(req));
  if (!errors.isEmpty()) return next(Object.assign(new Error('Validation error'), { status: 400 }));
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return next(Object.assign(new Error('Course not found'), { status: 404 }));
    const enrollment = await Enrollment.create({ courseId: course._id, studentId: req.user.id });
    res.status(201).json(enrollment);
  } catch (e) {
    if (e && e.code === 11000) {
      return next(Object.assign(new Error('Already enrolled'), { status: 409 }));
    }
    next(e);
  }
}

async function listEnrollments(req, res, next) {
  await Promise.all(idParam.map((v) => v.run(req)));
  const errors = (await validationResult(req));
  if (!errors.isEmpty()) return next(Object.assign(new Error('Validation error'), { status: 400 }));
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return next(Object.assign(new Error('Course not found'), { status: 404 }));
    if (course.teacherId.toString() !== req.user.id) {
      return next(Object.assign(new Error('Forbidden'), { status: 403 }));
    }
    const enrollments = await Enrollment.find({ courseId: course._id }).populate('studentId', 'name email');
    res.json(enrollments);
  } catch (e) {
    next(e);
  }
}

module.exports = { listCourses, getCourse, createCourse, enrollInCourse, listEnrollments };
