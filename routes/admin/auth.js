const express = require("express");

const { logger } = require("../../helpers/logger");
const Helpers = require("../../helpers/helpers");

const upload = require("../../connection/MulterConfig");

const isAuth = require("../../middleware/isAuth");
const isAdmin = require("../../middleware/isAdmin");
const isSuperAdmin = require("../../middleware/isSuperAdmin");

const authController = require("../../controllers/admin/authController");



router = express.Router();

//create admin
router.post("/sign_in", async (req, res) => {
    try {
      const sign_in = await authController.sign_in(req.body);
  
      return res.status(200).json(sign_in);
    } catch (e) {
      logger.error("🔥 error: %o", e);
      return res.status(500).json({
        error: true,
        message: "something went wrong, admin could not sign in",
      });
    }
  });

//forgot password
router.post(
  "/forgot_password", 
  async (req, res, next) => {
    try {
      const forgot_password = await authController.forgot_password(req.body);
  
      return res.status(200).json(forgot_password);
    } catch (e) {
      logger.error("🔥 error: %o", e);
      return res.status(500).json({
        error: true,
        message: "something went wrong, admin could not sign in",
      });
    }
  } );
  


//reset password
router.post(
  "/reset_password", 
  async (req, res) => {
      try {
        const reset_password = await authController.reset_password(req.body);
    
        return res.status(200).json(reset_password);
      } catch (e) {
        logger.error("🔥 error: %o", e);
        return res.status(500).json({
          error: true,
          message: "something went wrong, admin could not sign in",
        });
      }
    }
    );
  
  

module.exports = router;