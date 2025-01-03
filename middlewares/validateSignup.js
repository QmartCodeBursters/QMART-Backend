const { body, validationResult } = require('express-validator');

const validateSignup = [
  body('firstName', 'Firstname is required.').notEmpty(),
  body('lastName', 'Lastname is required.').notEmpty(),
  body('email')
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Invalid email address.'),
  body('phoneNumber')
    .isMobilePhone('en-NG')
    .withMessage('Invalid phone number.'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
    .matches(/\d/).withMessage('Password must contain a number.')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter.')
    .matches(/[@$!%*?&]/).withMessage('Password must contain a special character.'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match.');
    }
    return true;
  }),
  body('role')
    .isIn(['merchant', 'customer'])
    .withMessage('Invalid role.')
    .default('customer'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().reduce((acc, err) => {
        acc[err.param] = err.msg;
        return acc;
      }, {});
      return res.status(400).json({ errors: formattedErrors });
    }
    next();
  },
];

module.exports = validateSignup;
