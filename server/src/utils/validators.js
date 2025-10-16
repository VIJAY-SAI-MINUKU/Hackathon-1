const { body, param } = require('express-validator');

const emailValidator = body('email').isEmail().withMessage('Invalid email');
const passwordValidator = body('password').isLength({ min: 8 }).withMessage('Password too short');
const nameValidator = body('name').trim().notEmpty();
const roleValidator = body('role').isIn(['student', 'teacher']);

const objectIdParam = (name) => param(name).isMongoId();

const courseValidators = [
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('duration').trim().notEmpty(),
];

const assignmentValidators = [
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('dueDate').isISO8601(),
];

module.exports = {
  emailValidator,
  passwordValidator,
  nameValidator,
  roleValidator,
  objectIdParam,
  courseValidators,
  assignmentValidators,
};
