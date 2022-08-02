const { logger } = require("../../helpers/logger");
const User = require("../../models/user");
const Helpers = require("../../helpers/helpers");
const jwt = require("jsonwebtoken");
const Email = require("../../connection/Email");

const {
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} = require("../../validations/user");

exports.user_sign_in = async (data) => {
  try {
    logger.debug("User is signing in...");
    const { error } = validateLogin(data);
    if (error)
      return {
        status_code: 400,
        message: error.details[0].message,
      };
    let user, token;

    //check if email exists
    if (data.email) {
      user = await check_email(data.email);
      if (!user) {
        return {
          error: true,
          message: "User does not exist",
        };
      }
    }

    //check if username exists
    if (data.username) {
      user = await check_username(data.username);
      if (!user) {
        return {
          error: true,
          message: "User does not exist",
        };
      }
    }

    //compare password
    const valid_password = await Helpers.verify_hash(
      data.password,
      user.password
    );

    if (valid_password) {
      const today = new Date();
      const exp = new Date(today);
      exp.setDate(today.getDate() + 60);

      //if user signs in by email
      if (data.email) {
        token = await setup_token_email(user, process.env.JWT_SECRET);

        //if user signs in by username
      } else if (data.username) {
        token = await setup_token_username(user, process.env.JWT_SECRET);
      }
      //remove password field from response
      Reflect.deleteProperty(user._doc, "password");

      return {
        error: false,
        message: "User signed in successfully",
        token: token,
        data: user,
      };
    } else {
      if (data.email) {
        return {
          error: true,
          message: "Incorrect Email or password",
        };
      } else {
        return {
          error: true,
          message: "Incorrect Username or password",
        };
      }
    }
  } catch (e) {
    logger.error("🔥 error: %o", e);
    return {
      error: true,
      message: "something went wrong, user could not sign in",
    };
  }
};

exports.forgot_password = async (data) => {
  logger.debug("requesting reset token..");
  try {
    const { error } = validateForgotPassword(data);
    if (error)
      return {
        status_code: 400,
        message: error.details[0].message,
      };

    let user, token;

    //check if user exists
    user = await check_email(data.email);
    if (!user) {
      return {
        error: true,
        message: "User does not exist",
      };
    }

    token = await update_token(user);

    const email = [user.email];
    //send a mail here
    const email_template_data = {
      name: user.firstname,
      token: token,
    };

    console.log(email_template_data);
    //mail user
    await Email.postmark_mail(email, "forgot_password", email_template_data);

    return {
      error: false,
      message: "reset token sent",
    };
  } catch (e) {
    logger.error("🔥 error: %o", e);
    return {
      error: true,
      message: "something went wrong, could not send reset token",
    };
  }
};

exports.reset_password = async (data) => {
  logger.debug("User is resetting password");

  try {
    const { error } = validateResetPassword(data);
    if (error)
      return {
        status_code: 400,
        message: error.details[0].message,
      };

    let user, token;

    //check if user exists
    user = await check_email_reset_password(data.email);
    if (!user) {
      return {
        error: true,
        message: "User does not exist",
      };
    }

    //compare token
    const verify_token = await compare_token(
      data.token,
      user.password_reset_token
    );

    if (!verify_token) {
      return {
        error: true,
        message: "Incorrect token",
      };
    }

    const current_date = Helpers.get_current_timestamp();

    //check if token has expired
    if (current_date > user.password_reset_expires) {
      return {
        error: true,
        message: "Token is already expired",
      };
    }

    await update_user_details(user, data.password, current_date);

    return {
      error: false,
      message: "Password updated successfully",
    };
  } catch (e) {
    logger.error("🔥 error: %o", e);
    return {
      error: true,
      message: "something went wrong, could not reset password",
    };
  }
};

//check if username exists
const check_username = async (username) => {
  let check = await User.findOne({ username: username }).select("+password");
  return check;
};

//check if email exists
const check_email = async (email) => {
  let check = await User.findOne({ email: email }).select("+password");
  return check;
};

//check if email exists for reset password
const check_email_reset_password = async (email) => {
  let check = await User.findOne({ email: email }).select(
    "+password_reset_token"
  );
  return check;
};

//set up token
const setup_token_email = async (user, JWT_SECRET) => {
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

const setup_token_username = async (user, JWT_SECRET) => {
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

const update_token = async (user) => {
  //generate random token
  const token = Math.floor(100000 + Math.random() * 900000);
  //hash token
  const hash_token = await Helpers.hash(token.toString());

  //set expiry time for token
  const token_expiry = Helpers.addMinutes(new Date(), 4);

  //update user details
  await User.findByIdAndUpdate(user._id, {
    password_reset_token: hash_token,
    password_reset_expires: token_expiry,
  });
  return token;
};

const compare_token = async (token, reset_token) => {
  const validate_token = await Helpers.verify_hash(token, reset_token);
  return validate_token;
};

const update_user_details = async (user, oldPassword, current_date) => {
  //hash password
  const password = await Helpers.hash(oldPassword.toString());

  //update user details
  await User.findByIdAndUpdate(user._id, {
    password: password,
    password_changed_at: current_date,
  });
};
// module.exports = {
//   setup_token_email,
//   setup_token_username,
//   check_username,
//   check_email,
//   check_email_reset_password,
//   update_token,
//   compare_token,
//   update_user_details,
// };

// //reset pin
// exports.reset_pin = async (req, res) => {
//   try {
//     logger.debug("User is resetting pin").select("+password_reset_token");
//     const user = await User.findOne({
//       email: req.body.email,
//     });
//     if (!user)
//       return res.status(401).send({
//         error: true,
//         message: "User does not exist",
//       });

//     //compare token
//     const verify_token = await Helpers.verify_hash(
//       req.body.token,
//       user.password_reset_token
//     );

//     if (!verify_token) {
//       return res.status(401).json({
//         error: true,
//         message: "Incorrect token",
//       });
//     }

//     const current_date = Helpers.get_current_timestamp();

//     //check if token has expired
//     if (current_date > user.password_reset_expires) {
//       return res.status(401).json({
//         error: true,
//         message: "Token is already expired",
//       });
//     }

//     const pin = await Helpers.hash(req.body.pin.toString());

//     await User.findByIdAndUpdate(user._id, {
//       pin: pin,
//     });

//     return res.status(201).send({
//       error: false,
//       message: "Pin updated successfully",
//     });
//   } catch (e) {
//     logger.error("🔥 error: %o", e);
//     return res.status(500).json({
//       error: true,
//       message: "something went wrong, could not reset pin",
//     });
//   }
// };

// //verify pin
// exports.verify_pin = async (req, res) => {
//   try {
//     logger.debug("Verifying user pin...");

//     const user = await User.findById(req.current_user._id);
//     if (!user)
//       return res.status(401).send({
//         error: true,
//         message: "User does not exist",
//       });

//     const verify_pin = await Helpers.verify_hash(req.body.pin, user.pin);

//     if (!verify_pin) {
//       return res.status(401).json({
//         error: true,
//         message: "Incorrect pin",
//       });
//     }

//     return res.status(201).json({
//       error: false,
//       message: "pin is correct",
//     });
//   } catch (e) {
//     logger.error("🔥 error: %o", e);
//     return res.status(500).json({
//       error: true,
//       message: "something went wrong, could not verify password",
//     });
//   }
// };