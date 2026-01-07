import Joi from 'joi';
import validator from 'validator';

export const passwordSchema = Joi.string()
  .min(6)
  .max(255)
  .messages({
    'string.min': 'Password must be at least 6 characters long',
    'string.max': 'Password must not exceed 255 characters'
  });

export const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Username can only contain alphanumeric characters',
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username must not exceed 30 characters'
    }),
  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required'
    }),
  password: passwordSchema.required()
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

export const postSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(500)
    .required()
    .trim(),
  content: Joi.string()
    .min(1)
    .max(50000)
    .required()
    .trim(),
  isPublished: Joi.boolean().default(true)
});

export const commentSchema = Joi.object({
  content: Joi.string()
    .min(1)
    .max(5000)
    .required()
    .trim()
});

export const userUpdateSchema = Joi.object({
  bio: Joi.string()
    .max(500)
    .allow('')
    .trim()
    .optional(),
  avatarUrl: Joi.string()
    .max(5000)
    .allow('')
    .optional()
    .messages({
      'string.uri': 'Avatar URL must be a valid URL'
    }),
  location: Joi.string()
    .max(100)
    .allow('')
    .trim()
    .optional(),
  website: Joi.string()
    .max(500)
    .allow('')
    .trim()
    .optional(),
  profession: Joi.string()
    .max(100)
    .allow('')
    .trim()
    .optional(),
  theme: Joi.string()
    .valid('light', 'dark')
    .optional()
});

export const validateInput = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: true,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }

    req.validatedData = value;
    next();
  };
};
