const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

/// Make sure you cross check this and set it up to your style and how you use JWT
module.exports = async (req, res, next) => {
  const auth_header = req.headers.authorization;

  if (
    (auth_header && auth_header.split(" ")[0] === "Token") ||
    (auth_header && auth_header.split(" ")[0] === "Bearer")
  ) {
    const token = auth_header.split(" ")[1];
    try {
      decodedToken = await jwt.verify(token, `${process.env.JWT_SECRET}`);
    } catch (error) {
      return res.status(401).json({
        error: "true",
        message: "Invalid authorization header",
      });
    }
    if (!decodedToken._id) {
      return res.status(401).json({
        error: "true",
        message: "token expired",
      });
    }
    if (Date.now > decodedToken.exp) {
      return res.status(401).json({
        error: "true",
        message: "token expired",
      });
    }

    decodedToken._id = ObjectId(`${decodedToken._id}`);
    if (decodedToken.merchant) {
      decodedToken.merchant = ObjectId(`${decodedToken.merchant}`);
    }
    req.current_user = decodedToken;
    next();
  } else {
    return res.status(401).json({
      error: "true",
      message: "Access denied! No token provided",
    });
  }
};
