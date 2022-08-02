const Admin = require("../models/admins");

module.exports = async function (req, res, next) {
  try {
    const admin = await Admin.findById(req.current_user._id);

    if (!admin) {
      return res.status(403).send({
        error: true,
        message: "not an admin",
      });
    }

    if (!admin.is_audit && !admin.is_admin && !admin.is_super_admin) {
      return res.status(403).send({
        error: true,
        message:
          "Access denied, only admins and auditors can perform this operation.",
      });
    }
    next();
  } catch (e) {
    console.log(e);
    res.status(400).json({
      error: true,
      message: "Invalid token.",
    });
  }
};
