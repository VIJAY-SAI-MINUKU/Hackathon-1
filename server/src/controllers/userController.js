const { validationResult, param } = require('express-validator');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');

const idParam = [param('id').isMongoId()];

async function getUserGrades(req, res, next) {
  await Promise.all(idParam.map((v) => v.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(Object.assign(new Error('Validation error'), { status: 400 }));

  try {
    const userId = req.params.id;
    if (req.user.id !== userId && req.user.role !== 'teacher') {
      return next(Object.assign(new Error('Forbidden'), { status: 403 }));
    }

    const submissions = await Submission.find({ studentId: userId });

    const assignmentIds = submissions.map((s) => s.assignmentId);
    const assignments = await Assignment.find({ _id: { $in: assignmentIds } });

    const courseIds = assignments.map((a) => a.courseId.toString());
    const courses = await Course.find({ _id: { $in: courseIds } });

    const courseById = new Map(courses.map((c) => [c._id.toString(), c]));
    const assignmentById = new Map(assignments.map((a) => [a._id.toString(), a]));

    const byCourse = new Map();
    for (const s of submissions) {
      const a = assignmentById.get(s.assignmentId.toString());
      if (!a) continue;
      const courseKey = a.courseId.toString();
      if (!byCourse.has(courseKey)) {
        byCourse.set(courseKey, { courseId: courseKey, courseTitle: courseById.get(courseKey)?.title || 'Unknown', totalScore: 0, totalMaxScore: 0, submissions: [] });
      }
      const entry = byCourse.get(courseKey);
      if (s.grade && typeof s.grade.score === 'number' && typeof s.grade.maxScore === 'number') {
        entry.totalScore += s.grade.score;
        entry.totalMaxScore += s.grade.maxScore;
      }
      entry.submissions.push({ submissionId: s._id.toString(), assignmentId: s.assignmentId.toString(), grade: s.grade, feedback: s.feedback });
    }

    const coursesArr = Array.from(byCourse.values()).map((c) => ({
      ...c,
      percentage: c.totalMaxScore > 0 ? Math.round((c.totalScore / c.totalMaxScore) * 10000) / 100 : null,
    }));

    const grandMax = coursesArr.reduce((acc, c) => acc + c.totalMaxScore, 0);
    const grandScore = coursesArr.reduce((acc, c) => acc + c.totalScore, 0);

    const overall = grandMax > 0 ? Math.round((grandScore / grandMax) * 10000) / 100 : null;

    res.json({ courses: coursesArr, overall });
  } catch (e) {
    next(e);
  }
}

module.exports = { getUserGrades };
