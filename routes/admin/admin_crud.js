const express = require("express");

const Helpers = require("../../helpers/helpers");
const { logger } = require("../../helpers/logger");

const upload = require("../../connection/MulterConfig");

const isAuth = require("../../middleware/isAuth");
const isAdmin = require("../../middleware/isAdmin");
const isSuperAdmin = require("../../middleware/isSuperAdmin");

const adminController = require("../../controllers/admin/adminController");


router = express.Router();

//create admin
router.post("/create_admin", isAuth, isSuperAdmin, 
async (req, res, next) => {
  try {
    const create_admin = await adminController.create_admin(req.body);

    return res.status(200).json(create_admin);
  } catch (e) {
    logger.error("🔥 error: %o", e);
    return res.status(500).json({
      error: true,
      message: "something went wrong, could not create admin",
    });
  }
});

//update password
router.post("/update_password", isAuth, isAdmin, 
async (req, res, next) => {
  try {
    const update_password = await adminController.update_password(req.body, req.current_user._id);

    return res.status(200).json(update_password);
  } catch (e) {
    logger.error("🔥 error: %o", e);
    return res.status(500).json({
      error: true,
      message: "something went wrong, could not change password",
    });
  }
});

//get current admin
router.get("/me", [isAuth, isAdmin],
 async (req, res, next) => {
    try {
      const current_admin = await adminController.current_admin(req.current_user._id);
  
      return res.status(200).json(current_admin);
    } catch (e) {
      logger.error("🔥 error: %o", e);
      return res.status(500).json({
        error: true,
        message: "something went wrong, could not get current admin",
      });
    }
  });

//get all admins
router.get("/get_all_admins", [isAuth, isAdmin],
 async (req, res, next) => {
  try {
    const get_all_admins = await adminController.get_all_admins();

    return res.status(200).json(get_all_admins);
  } catch (e) {
    logger.error("🔥 error: %o", e);
    return res.status(500).json({
      error: true,
      message: "something went wrong, could not get all admins",
    });
  }
});

//deactivate an admin
router.patch(
  "/toggle_admin/:id",
  isAuth,
  isSuperAdmin,
  async (req, res, next) => {
    try {
      const toggle_admins = await adminController.toggle_admins(req.params.id);
  
      return res.status(200).json(toggle_admins);
    } catch (e) {
      logger.error("🔥 error: %o", e);
      return res.status(500).json({
        error: true,
        message: "something went wrong, could not deactivate admins",
      });
    }
  });

module.exports = router;