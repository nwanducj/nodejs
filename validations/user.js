const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

exports.validateRegistration = (user) => {
  const schema = Joi.object({
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    email: Joi.string().required().email(),
    username: Joi.string().required(),
    is_supplier: Joi.boolean().required(),
    phone: Joi.string().required(),
    password: Joi.string().required(),
    date_of_birth: Joi.string().required(),
    gender: Joi.string().required(),
    address: Joi.string().required(),
    security_question: Joi.string().required(),
    security_answer: Joi.string().required(),
  }).unknown();
  return schema.validate(user);
};

exports.validateEmail = (user) => {
  const schema = Joi.object({
    email: Joi.string().required().email(),
  }).unknown();
  return schema.validate(user);
};

exports.validateUsername = (user) => {
  const schema = Joi.object({
    username: Joi.string().required(),
  }).unknown();
  return schema.validate(user);
};

exports.validateLogin = (user) => {
  const schema = Joi.object({
    username: Joi.string(),
    email: Joi.string().email(),
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
