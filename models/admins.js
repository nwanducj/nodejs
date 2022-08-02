const mongoose = require("mongoose");

/// Basic details of an admin, you can add more
const adminSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "Please tell us your first name!"],
    },
    lastname: {
      type: String,
      required: [true, "Please tell us your last name!"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Please provide your phone number"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
      select: false,
    },
    is_active: {
      type: Boolean,
      default: false,
    },
    is_admin: {
      type: Boolean,
      default: false,
    },
    is_audit: {
      type: Boolean,
      default: false,
    },
    is_super_admin: {
      type: Boolean,
      default: false,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    password_changed_at: Date,
    password_reset_token: {
      type: String,
      select: false,
    },
    password_reset_expires: Date,
  },
  {
    timestamps: true,
  }
);

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
