const { logger } = require("../../helpers/logger");
const Helpers = require("../../helpers/helpers");

const jwt = require("jsonwebtoken");
const Email = require("../../connection/Email");

const Admin = require("../../models/admins");

const {
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} = require("../../validations/admin");

exports.sign_in = async (data) => {
  logger.debug("Admin is signing in...");

  try {
    const { error } = validateLogin(data);
    if (error)
      return {
        status_code: 400,
        message: error.details[0].message,
      };
    let token;

    //check if email exists
    const admin = await check_email(data.email);
    if (!admin) {
      return {
        error: true,
        message: "admin does not exist",
      };
    }
  

    //compare password
    const valid_password = await Helpers.verify_hash(
      data.password,
      admin.password
    );

    if (valid_password) {
      const today = new Date();
      const exp = new Date(today);
      exp.setDate(today.getDate() + 60);

      //if user signs in by email
      token = await setup_token(admin, process.env.JWT_SECRET);

      //remove password field from response
      Reflect.deleteProperty(admin._doc, "password");

      return {
        error: false,
        message: "Admin signed in successfully",
        token: token,
        data: admin,
      };
    } else {
      return {
        error: true,
        message: "Incorrect Email or password",
      };
    }
  } catch (e) {
    logger.error("🔥 error: %o", e);
    return{
      error: true,
      message: "something went wrong, admin could not sign in",
    };
}
}

exports.forgot_password = async (data) => {
  logger.debug("requesting reset token..");
    try {
      const { error } = validateForgotPassword(data);
      if (error)
        return {
          status_code: 400,
          message: error.details[0].message,
        };
  
      let admin, token;
  
      //check if user exists
      admin = await check_email(data.email);
      if (!admin) {
        return {
          error: true,
          message: "admin does not exist",
        }
      }
  
      token = await update_token(admin);
  
      const email = [admin.email];
      //send a mail here
      const email_template_data = {
        name: admin.firstname,
        token: token,
      };
  
      console.log(email_template_data);
      //mail admin
      await Email.postmark_mail(data.email, "forgot_password", email_template_data);
  
      return {
        error: false,
        message: "reset token sent",
      }
    } catch (e) {
      logger.error("🔥 error: %o", e);
      return {
        error: true,
        message: "something went wrong, could not send reset token",
      };
    } 
}

exports.reset_password = async (data) => {
  logger.debug("admin is resetting password");
  
    try {
      const { error } = validateResetPassword(data);
      if (error)
        return{
          status_code: 400,
          message: error.details[0].message,
        };
  
      let admin, token;
  
      //check if user exists
      admin = await check_email_reset_password(data.email);
      if (!admin) {
        return {
          error: true,
          message: "admin does not exist",
        };
      }
  
      //compare token
      const verify_token = await compare_token(
        data.token,
        admin.password_reset_token
      );
  
      if (!verify_token) {
        return {
          error: true,
          message: "Incorrect token",
        };
      }
  
      const current_date = Helpers.get_current_timestamp();
  
      //check if token has expired
      if (current_date > admin.password_reset_expires) {
        return {
          error: true,
          message: "Token is already expired",
        };
      }
  
      await update_admin_details(
        admin,
        data.password,
        current_date
      );
  
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
}

//check if email exists
const check_email = async (email) => {
  const check = await Admin.findOne({ email: email }).select("+password");
  return check;
};

//check if email exists for reset password
const check_email_reset_password = async (email) => {
  let check = await Admin.findOne({ email: email }).select(
    "+password_reset_token"
  );
  return check;
};

//set up token
const setup_token = async (admin, JWT_SECRET) => {
  const token = jwt.sign(
    {
      _id: admin._id.toString(),
      email: admin.email,
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
  await Admin.findByIdAndUpdate(user._id, {
    password_reset_token: hash_token,
    password_reset_expires: token_expiry,
  });
  return token;
};

const compare_token = async (token, reset_token) => {
  const validate_token = await Helpers.verify_hash(token, reset_token);
  return validate_token;
};

const update_admin_details = async (admin, oldPassword, current_date) => {
  //hash password
  const password = await Helpers.hash(oldPassword.toString());

  //update user details
  await Admin.findByIdAndUpdate(admin._id, {
    password: password,
    password_changed_at: current_date,
  });
};
