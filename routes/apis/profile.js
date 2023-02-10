const express = require("express");
const router = express.Router();
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const auth = require("../../middleware/auth");
const config = require("config");
const request = require("request");
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
//@route  api/profile
//@desc   get all the Profile
//@access Public

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.status(200).json(profiles);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});
//@route  api/profile/user/:user_id
//@desc   get single User Id
//@access Public

router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      res.status(500).json({ msg: "Profile not found" });
    }
    res.status(200).json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});
//@route  api/profile/
//@desc   delete user ,post ,Profile
//@access Private

router.delete("/", auth, async (req, res) => {
  try {
    await Profile.findOneAndRemove({ user: req.user.id });
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: "User Deleted" });
  } catch (error) {
    console.error(error);
  }
});

//@route  api/profile/experience
//@desc   delete user ,post ,Profile
//@access Private

router.put(
  "/experience",
  [
    auth,
    check("title", "title Field is empty").not().isEmpty(),
    check("company", "company Field is empty").not().isEmpty(),
    check("from", "from Field is empty").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ msg: errors.array() });
    }
    const { title, company, location, from, to, description, current } =
      req.body;
    const newExp = { title, company, location, from, to, description, current };
    try {
      const profile = await Profile.findOne({ user: req.user.id }).populate(
        "user",
        ["email"]
      );
      profile.experience.unshift(newExp);
      await profile.save();
      res.status(400).json(profile);
    } catch (error) {
      console.error(error);
      res.status(500).send("server Error");
    }
  }
);
//@route  api/profile/experience/:experience_id
//@desc   delete user ,post ,Profile
//@access Private

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "server error" });
  }
});
//@route  api/profile/education
//@desc   add/create education
//@access Private

router.put(
  "/education",
  [
    auth,
    check("school", "school Field is empty").not().isEmpty(),
    check("degree", "degree Field is empty").not().isEmpty(),
    check("fieldofstudy", "fieldofstudy Field is empty").not().isEmpty(),
    check("from", "from Field is empty").not().isEmpty(),
    check("to", "to Field is empty").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ msg: errors.array() });
    }
    const { school, degree, fieldofstudy, from, current, to } = req.body;
    const newEdu = { school, degree, fieldofstudy, current, from, to };
    try {
      const profile = await Profile.findOne({ user: req.user.id }).populate(
        "user",
        ["email"]
      );
      profile.education.unshift(newEdu);
      await profile.save();
      res.status(400).json(profile);
    } catch (error) {
      console.error(error);
      res.status(500).send("server Error");
    }
  }
);
//@route  api/profile/experience/:edu_id
//@desc   delete education
//@access Private

router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);
    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "server error" });
  }
});

//@route  api/profile/github/:username
//@desc   everyone can see user github Repos
//@access Public

router.get("/github/:username", async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        "githubClientId"
      )}&client_secret=${config.githubSecret}`,
      method: "GET",
      headers: { "user-agent": "node.js" },
    };
    request(options, (error, response, body) => {
      if (error) console.error(error);
      if (response.statusCode == !200) {
      return  res.status(404).json({ msg: "No github profile found" });
      }
      res.json(JSON.parse(body));
    });
  } catch (error) {
    console.error(error.message);
    req.status(500).json({ msg: "No github User Found(Server Error)" });
  }
});
module.exports = router;
