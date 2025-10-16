const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../src/models/User');
const Course = require('../src/models/Course');
const Assignment = require('../src/models/Assignment');
const Submission = require('../src/models/Submission');

function authHeader(token) { return { Authorization: `Bearer ${token}` }; }

describe('LMS API end-to-end basics', () => {
  let teacherToken;
  let studentToken;
  let courseId;
  let assignmentId;

  beforeAll(async () => {
    // password: password123
    const passwordHash = await bcrypt.hash('password123', 10);
    await User.create({ name: 'Teacher', email: 't@example.com', passwordHash, role: 'teacher' });
    await User.create({ name: 'Student', email: 's@example.com', passwordHash, role: 'student' });
  });

  afterAll(async () => {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  });

  it('login teacher and student', async () => {
    const tRes = await request(app).post('/api/auth/login').send({ email: 't@example.com', password: 'password123' });
    expect(tRes.status).toBe(200);
    teacherToken = tRes.body.token;
    const sRes = await request(app).post('/api/auth/login').send({ email: 's@example.com', password: 'password123' });
    expect(sRes.status).toBe(200);
    studentToken = sRes.body.token;
  });

  it('teacher creates course', async () => {
    const res = await request(app).post('/api/courses').set(authHeader(teacherToken)).send({ title: 'Course 1', description: 'Desc', duration: '4 weeks' });
    expect(res.status).toBe(201);
    courseId = res.body._id;
  });

  it('student lists courses and enrolls', async () => {
    const listRes = await request(app).get('/api/courses').set(authHeader(studentToken));
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);
    const enrollRes = await request(app).post(`/api/courses/${courseId}/enroll`).set(authHeader(studentToken));
    expect(enrollRes.status).toBe(201);
  });

  it('teacher creates assignment and student submits', async () => {
    const aRes = await request(app)
      .post(`/api/courses/${courseId}/assignments`)
      .set(authHeader(teacherToken))
      .field('title', 'A1')
      .field('description', 'Do X')
      .field('dueDate', new Date(Date.now() + 86400000).toISOString());
    expect(aRes.status).toBe(201);
    assignmentId = aRes.body._id;

    const sRes = await request(app)
      .post(`/api/assignments/${assignmentId}/submit`)
      .set(authHeader(studentToken))
      .field('text', 'My answer');
    expect(sRes.status).toBe(201);
  });

  it('teacher lists submissions and grades', async () => {
    const list = await request(app).get(`/api/assignments/${assignmentId}/submissions`).set(authHeader(teacherToken));
    expect(list.status).toBe(200);
    expect(list.body.length).toBe(1);
    const sid = list.body[0]._id || list.body[0].id || list.body[0]._id;

    const gradeRes = await request(app)
      .post(`/api/submissions/${list.body[0]._id}/grade`)
      .set(authHeader(teacherToken))
      .send({ score: 90, maxScore: 100, feedback: 'Well done' });
    expect(gradeRes.status).toBe(200);

    const student = await User.findOne({ email: 's@example.com' });
    const grades = await request(app).get(`/api/users/${student._id}/grades`).set(authHeader(studentToken));
    expect(grades.status).toBe(200);
    expect(grades.body.overall).toBeGreaterThan(0);
  });
});
