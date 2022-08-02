const express = require("express");
const _ = require("lodash");

const { logger } = require("../../helpers/logger");
const Helpers = require("../../helpers/helpers");

const upload = require("../../connection/MulterConfig");

const isAuth = require("../../middleware/isAuth");

const userController = require("../../controllers/user/userController");
const User = require("../../models/user");


router = express.Router();

//sign up
router.post("/sign_up", async (req, res) => {
  try {
    const user_sign_up= await userController.user_sign_up(req.body);

    return res.status(200).json(user_sign_up);
  } catch (e) {
    logger.error("🔥 error: %o", e);
    return res.status(500).json({
      error: true,
      message: "something went wrong, user could not sign up",
    });
  }
});

router.patch("/update_user/", isAuth, async (req, res) => {
  try {
    const update_user= await userController.update_user(req.body, req.current_user._id);

    return res.status(200).json(update_user);
  } catch (e) {
    logger.error("🔥 error: %o", e);
    return res.status(500).json({
      error: true,
      message: "something went wrong, could not update user",
    });
  }
});

// //get current user
// router.get("/me", isAuth, userController.current_user);

// //create user pin
// router.post(
//   "/create_pin",
//   [
//     isAuth,
//     celebrate({
//       body: Joi.object({
//         pin: Joi.string().required(),
//       }),
//     }),
//   ],
//   userController.create_pin
// );

module.exports = router;