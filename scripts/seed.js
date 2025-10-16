#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../server/src/models/User');
const Course = require('../server/src/models/Course');
const Assignment = require('../server/src/models/Assignment');
const Enrollment = require('../server/src/models/Enrollment');
const Submission = require('../server/src/models/Submission');

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/lms';
  await mongoose.connect(uri);

  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    Assignment.deleteMany({}),
    Enrollment.deleteMany({}),
    Submission.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash('password123', 10);
  const teacher = await User.create({ name: 'Alice Teacher', email: 'teacher@example.com', passwordHash, role: 'teacher' });
  const student = await User.create({ name: 'Bob Student', email: 'student@example.com', passwordHash, role: 'student' });

  const course = await Course.create({ title: 'Intro to LMS', description: 'Sample course', duration: '4 weeks', teacherId: teacher._id });

  const enrollment = await Enrollment.create({ courseId: course._id, studentId: student._id });

  const assignment = await Assignment.create({ courseId: course._id, title: 'Assignment 1', description: 'Do something', dueDate: new Date(Date.now() + 7*24*60*60*1000) });

  const submission = await Submission.create({ assignmentId: assignment._id, studentId: student._id, text: 'My answer' });

  console.log('Seed completed.');
  console.log({ teacher: teacher.email, student: student.email, courseId: course._id.toString(), assignmentId: assignment._id.toString(), enrollmentId: enrollment._id.toString(), submissionId: submission._id.toString() });

  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
