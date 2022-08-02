const axios = require("axios");
const uniqid = require("uniqid");
const jwt = require("jsonwebtoken");
const _ = require("lodash");

const { logger } = require("../../helpers/logger");
const Helpers = require("../../helpers/helpers");
const Email = require("../../connection/Email");

const User = require("../../models/user");

const {
  validateRegistration,
} = require("../../validations/user");

exports.user_sign_up = async (data) => {
  logger.debug("Creating a new user");
  try {
    const { error } = validateRegistration(data);
    if (error)
      return res.status(400).send({
        status_code: 400,
        message: error.details[0].message,
      });

    //check if email exists
    const email_check = await check_email(data.email);
    if (email_check) {
      return {
        error: true,
        message: "Email exists already, please login.",
      };
    } 

    //check if username exists
    const username_check = await check_username(data.username);
    if (username_check) {
      return {
        error: true,
        message: "username exists already, please pick another one.",
      };
    } 
    //create a user
    //hash password
    const password = await Helpers.hash(data.password.toString());

    const user = await User.create({
      ...data,
      password,
    });

    await user.save();

    const token = await setup_token(
      user,
      process.env.JWT_SECRET
    );

    //welcome mail

    // Reflect.deleteProperty(user._doc, "password");

    // //send mail here to notify the user of account created

    // const email_template_data = {
    //   name: user.firstname,
    // };
    // await Email.postmark_mail(data.email, "welcome_user", email_template_data);

    return {
      error: false,
      message: "User created successfully",
      token: token,
      data: user,
    };
  } catch (e) {
    logger.error("🔥 error: %o", e);
    return {
      error: true,
      message: "something went wrong, could not create user"
  }
}
}

exports.update_user = async (data, id) => {
  logger.debug("update a user...");
  try {
    const user_id = id;

    //list all the updatable fields for user
    let body = _.pick(data.body, ["phone", "firstname", "lastname"]);

    //update user
    let user = await User.findByIdAndUpdate(user_id, body, {
      new: true,
    }).lean();

    if (user == null) {
      return {
        status_code: 400,
        message: "User does not exist",
      };
    }

    return {
      error: false,
      message: "user updated successfully",
      data: user,
    };
  } catch (e) {
    logger.error("🔥 error: %o", e);
    return {
      error: true,
      message: "something went wrong, could not update user",
    };
  }
}

//check if email exists
const check_email = async (email) => {
  let check = await User.findOne({ email: email });
  return check;
};

//check if username exists
const check_username = async (username) => {
  let check = await User.findOne({ username: username });
  return check;
};

//set up token
const setup_token = async (user, JWT_SECRET) => {
  const today = new Date();
  const exp = new Date(today);
  // exp.setDate(today.getDate() + 60);

  const token = jwt.sign(
    {
      _id: user._id.toString(),
      email: user.email,
      exp: Date.now() + 600000,
    },
    `${JWT_SECRET}`
  );
  return token;
};


// //get current user
// exports.current_user = async (req, res, next) => {
//   try {
//     logger.debug("Getting current user");

//     //get the details of the user currently logged in by passing the id in the token
//     const user = await User.findById(req.current_user._id);

//     return res.status(200).json({
//       error: false,
//       message: "User retrieved successfully",
//       data: user,
//     });
//   } catch (e) {
//     logger.error("🔥 error: %o", e);
//     return res.status(500).json({
//       error: true,
//       message: "something went wrong, could not get user",
//     });
//   }
// };

// //create transaction pin
// exports.create_pin = async (req, res, next) => {
//   try {
//     logger.debug("Creating user pin");
//     const user = await User.findById(req.current_user._id);
//     const hashed_pin = await Helpers.hash(req.body.pin);
//     if (user.is_pin_set) {
//       return res.status(400).send({
//         error: true,
//         message: "Your pin has been set before",
//       });
//     }
//     const create_pin = await User.findByIdAndUpdate(req.current_user._id, {
//       pin: hashed_pin,
//       is_pin_set: true,
//     });
//     return res.status(201).send({
//       error: false,
//       message: "User Pin created successfully",
//     });
//   } catch (e) {
//     logger.error("🔥 error: %o", e);
//     return res.status(500).json({
//       error: true,
//       message: "something went wrong, could not create transaction pin",
//     });
//   }
// };