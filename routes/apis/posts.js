const express = require("express");
const auth = require("../../middleware/auth");
const router = express.Router();
const Post = require("../../models/posts");
const { check, validationResult } = require("express-validator");
const User = require("../../models/User");

//@route  api/posts
//@desc   posting the Post
//@access public
router.post(
  "/",
  [auth, [check("text", "text is empty").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
      const post = await newPost.save();
      res.json(post);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

//@route  api/posts
//@desc   get all post
//@access private
router.get("/", auth, async (req, res) => {
  try {
    const post = await Post.find().sort({ data: -1 }).populate("user", "email");
    res.json(post);
  } catch (error) {
    console.error(error.message);
    res.json({ msg: "Server Error " });
  }
});
//@route  api/posts
//@desc   get all post
//@access private
router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "No user Found" });
    }
    res.json({ post });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "No user Found" });
    }
    res.json({ msg: "Server Error " });
  }
});
//@route  api/posts
//@desc   delete post by id
//@access private
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.json({ msg: "no post found" });
    }
    // check for authorized user
    if (post.user.toString() == req.user.id) {
      res.status(401).json({ msg: "authorized user" });
    }
    await post.remove();
    res.json({ msg: "post removed" });
  } catch (error) {
    console.error(error.message);
    res.json({ msg: "Server Error " });
  }
});
//@route  api/posts/like/:id
//@desc   like post
//@access private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      res.json({ msg: "post already been Liked" });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    res.json({ msg: "Server error" });
  }
});
//@route  api/posts/like/:id
//@desc   unlike post
//@access private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length == 0
    ) {
      res.json({ msg: "post not been liked yet" });
    }
    const removedIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(removedIndex,1);
    await post.save();

    res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    res.json({ msg: "Server error" });
  }
});
//@route  api/comment/:id
//@desc   add comment
//@access public
router.post(
  "/comment/:id",
  [auth, [check("text", "text is empty").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };
      post.comments.unshift(newComment);
      await post.save();
      res.json(post.comments);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

// @route    DELETE api/posts/comment/:id/:comment_id
// @desc     Delete comment
// @access   Private
router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Pull out comment
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );
    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: "Comment does not exist" });
    }
    // Check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    //   post.comments = post.comments.filter(
    //     ({ id }) => id !== req.params.comment_id
    //   );
    const removedIndex = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);
    post.comments.splice(removedIndex,1);
    await post.save();

    return res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server Error");
  }
});
module.exports = router;
