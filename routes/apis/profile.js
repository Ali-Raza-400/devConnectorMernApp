const express = require("express");
const router = express.Router();
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
//@route  api/profile/me
//@desc   Get the current User Profile
//@access public
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );
    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for the user" });
    }
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

//@route  api/profile
//@desc   Posting the User Data
//@access private

router.post(
  "/",
  [
    auth,
    [
      check("status", "status Field is empty").not().isEmpty(),
      check("skill", "skill is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      location,
      website,
      skills,
      bio,
      status,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
      ...rest
      // spread the rest of the fields we don't need to check
    } = req.body;
    // build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (skills)
      profileFields.skills = skills.split(",").map((skill) => skill.trim());

    // build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      // if user profile already exist then update
      if (profile) {
        profile = await Profile.findByIdAndUpdate(
          { user: req.user.id },
          { user: profileFields },
          { new: true }
        );
        return res.json(profile);
      }
      // else create new Profile
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error);
      res.status(500).send("server Error");
    }
  }
);

module.exports = router;
