# LMS - Full Stack (Hackathon Submission)

Production-ready Learning Management System implementing Bronze→Platinum features from the hackathon brief (see `Hackathon_Documentation.pdf`).

## Tech Stack
- Client: React (Vite), React Router
- Server: Node 18+, Express, Mongoose, JWT, bcrypt, multer
- DB: MongoDB (Atlas/local)
- Storage: Local uploads folder; optional S3-compatible
- Tests: Jest + Supertest
- DevOps: Dockerfiles, docker-compose, GitHub Actions CI

## Repository Structure
```
/client
  package.json, vite.config.js, src/
/server
  package.json, src/index.js, src/app.js
  src/models, src/controllers, src/routes, src/middlewares, src/utils
  tests (jest + supertest)
/scripts
  seed.js, start-dev.sh
Dockerfile(s), docker-compose.yml, .env.example, .github/workflows/ci.yml
```

## Environment
Copy `.env.example` to `.env` and fill values:
- PORT, NODE_ENV, MONGO_URI, JWT_SECRET, FRONTEND_URL
- Optional S3: S3_REGION, S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_PUBLIC_BASE_URL

## Local Setup
```bash
# root
npm install
# server
cd server && npm install
# client
cd ../client && npm install
# run mongo (if needed)
docker compose up -d mongo
# seed demo data (root .env with MONGO_URI)
node scripts/seed.js
# start dev (client+server concurrently)
cd .. && npm run dev
```

### Docker (full stack)
```bash
docker compose up --build
```

## Demo Credentials
- Teacher: teacher@example.com / password123
- Student: student@example.com / password123

## API Endpoints
- POST /api/auth/register
- POST /api/auth/login
- GET /api/courses
- GET /api/courses?enrolled=true (student)
- GET /api/courses/:id
- POST /api/courses (teacher)
- POST /api/courses/:id/enroll (student)
- GET /api/courses/:id/enrollments (teacher)
- POST /api/courses/:id/assignments (teacher)
- GET /api/courses/:id/assignments
- POST /api/assignments/:id/submit (student)
- GET /api/assignments/:id/submissions (teacher)
- POST /api/submissions/:id/grade (teacher)
- GET /api/users/:id/grades (student)

### Sample curl
```bash
# register
curl -X POST http://localhost:5000/api/auth/register -H 'Content-Type: application/json' -d '{"name":"T","email":"t2@example.com","password":"password123","role":"teacher"}'
# login
curl -X POST http://localhost:5000/api/auth/login -H 'Content-Type: application/json' -d '{"email":"teacher@example.com","password":"password123"}'
# create course (teacher)
TOKEN=...; curl -X POST http://localhost:5000/api/courses -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"title":"C1","description":"D","duration":"4 weeks"}'
# enroll (student)
STOKEN=...; CID=...; curl -X POST http://localhost:5000/api/courses/$CID/enroll -H "Authorization: Bearer $STOKEN"
# list assignments
curl -H "Authorization: Bearer $STOKEN" http://localhost:5000/api/courses/$CID/assignments
# submit assignment (student)
AID=...; curl -X POST -H "Authorization: Bearer $STOKEN" -F 'text=hello' -F 'files=@README.md' http://localhost:5000/api/assignments/$AID/submit
# grade submission (teacher)
SID=...; curl -X POST -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"score":90,"maxScore":100,"feedback":"Good"}' http://localhost:5000/api/submissions/$SID/grade
# get grades (student)
UID=...; curl -H "Authorization: Bearer $STOKEN" http://localhost:5000/api/users/$UID/grades
```

## Features by Hackathon Tier
- Bronze: Register, Login (JWT), Teacher create course, Student list courses
- Silver: Enrollment, Student view enrolled (via `GET /api/courses?enrolled=true`), Teacher view enrolled list
- Gold: Teacher create assignments (attachments), Student submit (files+text), Teacher list submissions
- Platinum: Grade submissions with feedback, Students view aggregated grades and overall percentage
- Bonus: Notifications model (extensible), materials upload on courses (API-level fields)

## Tests
```bash
cd server && npm test
```
Covers: auth login, course creation, enrollment, assignment submit, grading, user grades.

## Deployment
- Client: Vercel/Netlify (build: `npm run build`)
- Server: Render/Railway
  - Start: `node src/index.js`
  - Env: JWT_SECRET, MONGO_URI, FRONTEND_URL

### Render quickstart
- Create new Web Service from `/server`
- Env: `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`
- Port: 5000
- Start command: `node src/index.js`

## Acceptance Test Checklist
- Bronze
  - [ ] Register student/teacher
  - [ ] Login returns JWT
  - [ ] Teacher creates course
  - [ ] Student lists courses
- Silver
  - [ ] Student enrolls
  - [ ] Student views enrolled courses
  - [ ] Teacher views enrolled list
- Gold
  - [ ] Teacher creates assignment
  - [ ] Student submits assignment
  - [ ] Teacher views submissions
- Platinum
  - [ ] Teacher grades submission + feedback
  - [ ] Student sees grade and overall course percentage

## What I Built
- Full-stack LMS with role-based access and file uploads
- REST API covering auth, courses, enrollment, assignments, submissions, grading, user grades
- React client with auth, dashboard, course & assignment pages, profile, notifications
- CI (GitHub Actions) and Docker for dev
- Seeded demo accounts and data
