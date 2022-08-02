const { logger } = require("../../helpers/logger");
const Helpers = require("../../helpers/helpers");

const Email = require("../../connection/Email");
const { ForecastQueryService } = require("aws-sdk");

const User = require("../../models/user");
const Admin = require("../../models/admins");

const { validateRegistration } = require("../../validations/admin");

exports.create_admin = async (data) => {
  logger.debug("Creating a new admin");
  try {
    const { error } = validateRegistration(data);
    if (error)
      return {
        status_code: 400,
        message: error.details[0].message,
      };

    //check if user email exists
    const admin_email = await check_email(data.email);
    if (admin_email) {
      return {
        error: true,
        message: "Email exists already, please Login",
      };
    }

    //check if phone exists
    const admin_phone = await check_phone(data.phone);
    if (admin_phone) {
      return {
        error: true,
        message: "Phone exists already",
      };
    }

    let gen_password = Math.floor(100000 + Math.random() * 900000);
    console.log(gen_password);
    const password = await Helpers.hash(gen_password.toString())

    //set permission for admin
    let is_admin, is_super_admin, is_audit;
    if (data.role === "admin") {
      is_admin = true;
    } else if (data.role == "super admin") {
      is_super_admin = true;
    } else {
      is_audit = true;
    }

    const admin = await Admin.create({
      ...data,
      password,
    });

    await admin.save();

    Reflect.deleteProperty(admin._doc, "password");

    //send mail here to notify the admin created of account and password

    const email_template_data = {
      name: admin.firstname,
      password: gen_password,
    };
    await Email.postmark_mail(data.email, "welcome_admin", email_template_data);

    return {
      error: false,
      message: "Admin created successfully",
      data: admin,
    };
  } catch (e) {
    logger.error("🔥 error: %o", e);
    return {
      error: true,
      message: "something went wrong, could not create admin",
    };
  }
};

exports.update_password = async (data, id) => {
  logger.debug("editing admin profile...");

  try {
    //select the password field in the admin model
    const user = await Admin.findById(id).select("+password");

    //check if current password is valid
    const check = await Helpers.verify_hash(data.password, user.password);

    if (!check) {
      return {
        error: true,
        message: "Incorrect password",
      };
    }

    //hash the new password entered
    let password = await Helpers.hash(data.new_password);

    //update the password field with the new hashed password
    const admin = await Admin.findByIdAndUpdate(id, {
      password: password,
    });

    //delete the password field from the response been sent
    //admin._doc is referring to mongodb => use console.log({...admin}) to see it
    Reflect.deleteProperty(admin._doc, "password");

    return {
      error: false,
      message: "password changed successfully",
      data: admin,
    };
  } catch (e) {
    logger.error("🔥 error: %o", e);
    next();
    return {
      error: true,
      message: "something went wrong, could not change password",
    };
  }
};

exports.current_admin = async (data) => {
  logger.debug("Getting current admin...");
  try {
    //get the details of the admin currently logged in by passing the id in the token
    const admin = await get_admin(data);
    return {
      error: false,
      message: "admin retrieved successfully",
      data: admin,
    };
  } catch (e) {
    logger.error("🔥 error: %o", e);
    return {
      error: true,
      message: "something went wrong, could not get admin",
    };
  }
};

exports.get_all_admins = async () => {
  logger.debug("Getting all admins...");

  try {
    let admin = await get_admins();

    return {
      error: false,
      message: "admin retrieved successfully",
      data: admin,
    };
  } catch (e) {
    logger.error("🔥 error: %o", e);
    return {
      error: true,
      message: "something went wrong, could not get admin",
    };
  }
};

exports.toggle_admins = async (data) => {
  logger.debug("deactivate an admin");
  try {
    const admin = await get_admin(data);

    //check if is_active is set to true, then set is_active to false
    if (admin.is_active == true) {
      admin.is_active = false;
    } else {
      admin.is_active = true;
    }

    await admin.save();

    return {
      error: false,
      message: `is_active set to ${admin.is_active} successfully`,
      data: admin,
    };
  } catch (e) {
    logger.error("🔥 error: %o", e);
    return {
      error: true,
      message: "something went wrong, could not deactivate admin",
    };
  }
};

const check_email = async (email) => {
  const check = await Admin.findOne({ email: email });
  return check;
};

const check_phone = async (phone) => {
  const check = await Admin.findOne({ phone: phone });
  return check;
};


//find admin
const get_admin = async (id) => {
  const admin = await Admin.findById(id);
  return admin;
};

//get admins
const get_admins = async () => {
  let admins = await Admin.aggregate([
    {
      $match: {},
    },
    {
      $lookup: {
        from: "admins",
        localField: "created_by",
        foreignField: "_id",
        as: "createdBy",
      },
    },
    {
      $project: {
        _id: 1,
        is_active: 1,
        is_admin: 1,
        is_audit: 1,
        is_super_admin: 1,
        created_by: 1,
        firstname: 1,
        lastname: 1,
        phone: 1,
        email: 1,
        createdAt: 1,
        createdBy: {
          firstname: 1,
          lastname: 1,
        },
      },
    },
  ]);
  return admins;
};