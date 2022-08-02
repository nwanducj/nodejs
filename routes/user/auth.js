const express = require("express");

const isAuth = require("../../middleware/isAuth");

const authController = require("../../controllers/user/authController");

router = express.Router();

//sign in
router.post("/sign_in", async (req, res) => {
  try {
    const login = await authController.user_sign_in(req.body);

    return res.status(200).json(login);
  } catch (e) {
    logger.error("🔥 error: %o", e);
    return res.status(500).json({
      error: true,
      message: "something went wrong, user could not sign in",
    });
  }
});

//forgot password
router.post("/forgot_password", async (req, res) => {
  try {
    const forgot_password = await authController.forgot_password(req.body);

    return res.status(200).json(forgot_password);
  } catch (e) {
    logger.error("🔥 error: %o", e);
    return res.status(500).json({
      error: true,
      message: "something went wrong, could not forgot password",
    });
  }
});

//reset password
router.post("/reset_password", async (req, res) => {
  try {
    const reset_password = await authController.reset_password(req.body);

    return res.status(200).json(reset_password);
  } catch (e) {
    logger.error("🔥 error: %o", e);
    return res.status(500).json({
      error: true,
      message: "something went wrong, could not reset password",
    });
  }
});

// //reset pin
// router.post(
//   "/reset_pin",
//   celebrate({
//     body: {
//       email: Joi.string().required().email(),
//       pin: Joi.string().required(),
//       token: Joi.string().required(),
//     },
//   }),
//   authController.reset_pin
// );

// //verify pin
// router.post(
//   "/verify_pin",
//   [
//     celebrate({
//       body: {
//         pin: Joi.string().required(),
//       },
//     }),
//     isAuth,
//   ],
//   authController.verify_pin
// );

module.exports = router;
