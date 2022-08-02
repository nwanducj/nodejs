const bcrypt = require("bcryptjs");
const dayjs = require("dayjs");
const User = require("../models/user");
const { logger } = require("./logger");
const Cryptr = require("cryptr");
const cryptr = new Cryptr(process.env.CRYPTR_CODE);
const axios = require("axios");

exports.check_supplier = async (id) => {
  const check = await User.findById(id)
  return check
};

//check is user is a supplier
exports.check_user = async (user_id) => {
  const check_id = await this.check_supplier(user_id)
  if (check_id.is_supplier === true){
      return true
  }
}

exports.hash = async (password) => {
  const hashed_password = await bcrypt.hash(password, 12);
  return hashed_password;
};

exports.verify_hash = async (password, hashed_password) => {
  const verify_password = await bcrypt.compare(password, hashed_password);
  return verify_password;
};

//get current timestamp
exports.get_current_timestamp = (day = 0) => {
  let old_date = new Date();

  let date = new Date(old_date.setDate(old_date.getDate() + day));

  return dayjs(date, "YYYY-MM-DD HH:mm:ss.SSS").toDate();
};

//verify pin (in-Api usage)
exports.verify_user_pin = async (user_id, pin, res) => {
  logger.debug("Verifying user pin...");

  const user = await User.findById(user_id).select("+pin");
  if (!user)
    return res.status(401).send({
      error: true,
      message: "User does not exist",
    });
  const verify_pin = await this.verify_hash(pin, user.pin);

  if (!verify_pin) {
    return res
      .status(401)
      .send({
        error: true,
        message: "Incorrect pin",
      })
      .end();
  }

  return verify_pin;
};

exports.verify_pin = async (user_id, pin) => {
  logger.debug("Verifying user pin...");

  const user = await User.findById(user_id).select("+pin");
  if (!user) {
    return false;
  }
  const is_valid = await this.verify_hash(pin, user.pin);

  if (!is_valid) {
    return false;
  }

  return true;
};

exports.monthDiff = (from, to) => {
  let months =
    to.getMonth() -
    from.getMonth() +
    12 * (to.getFullYear() - from.getFullYear());

  if (to.getDate() < from.getDate()) {
    months--;
  }
  return months;
};

exports.daysDiff = (from, to) => {
  const diff = to.getTime() - from.getTime();
  return diff / (1000 * 3600 * 24);
};

exports.addDays = (date, days) => {
  let result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

exports.addMonths = (date, month) => {
  date.setMonth(date.getMonth() + month);
  return date;
};

exports.addMinutes = (date, minutes) => {
  return new Date(date.getTime() + minutes * 60000);
};

exports.subMonths = (date, month) => {
  date.setMonth(date.getMonth() - month);
  return date;
};

//cryptr encrypt
exports.encrypt = async (data) => {
  data = JSON.stringify(data);
  const encrypted_data = await cryptr.encrypt(data);
  return encrypted_data;
};

//cryptr encrypt
exports.decrypt = (data) => {
  const decrypted_data = cryptr.decrypt(data);
  return JSON.parse(decrypted_data);
};