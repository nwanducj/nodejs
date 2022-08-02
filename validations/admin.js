const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

exports.validateRegistration = (user) => {
  const schema = Joi.object({
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    email: Joi.string().required().email(),
    phone: Joi.string().required(),
    password: Joi.string(),
    is_admin: Joi.boolean(),
    is_audit: Joi.boolean(),
    is_super_admin: Joi.boolean(),
    is_active: Joi.boolean(),
    created_by: Joi.objectId(),
  }).unknown();
  return schema.validate(user);
};

exports.validateLogin = (user) => {
  const schema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }).unknown();
  return schema.validate(user);
};

exports.validateForgotPassword = (user) => {
  const schema = Joi.object({
    email: Joi.string().required().email(),
  }).unknown();
  return schema.validate(user);
};

exports.validateResetPassword = (user) => {
  const schema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    token: Joi.string().required(),
  }).unknown();
  return schema.validate(user);
};