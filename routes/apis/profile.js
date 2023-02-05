const express = require("express");
const router = express.Router();
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const auth = require("../../middleware/auth");
//@route  api/profile/me
//@desc   Get the current User Profile
//@access public
router.get("/me", auth, async(req, res) => {
  try {
    const profile =await Profile.findOne({ user: req.user.id }).populate("user", [
      "name",
      "avatar",
    ]);
    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for the user" });
    }
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
