const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  // getting the token from the header
  const token = req.header("x-auth-token");

  // if no token
  if (!token) {
    return res.status(401).json({ msg: "Access Denied No token" });
  }
  // if token
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    req.user = decoded.user;
    next();
  } catch (error) {
    console.error(error);
  }
};
