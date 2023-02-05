const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { validationResult, check } = require("express-validator");

//@route  api/auth
//@desc   test routes
//@access public
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json("Server Error");
  }
});

//@route  api/auth
//@desc   authenticate user and purpose to get token and hit private routes
//@access public
router.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is Required").exists(), //checking if email exist not checking the length we did in register route
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      // check whether user already exists
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }
      // encrypt password
      const isMatch =await bcrypt.compare(password, user.password);
      if (!isMatch) {
      return  res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
      }
      // Json webtoken
      const payload = {
        user: {
          id: user.id,
        },
      };
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (error, token) => {
          if (error) throw error;
          res.json({ token });
        }
      );
    } catch (error) {}
  }
);
module.exports = router;
