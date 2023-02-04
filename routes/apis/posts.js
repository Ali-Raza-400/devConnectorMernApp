const express=require('express')
const router =express.Router()

//@route  api/posts
//@desc   test routes
//@access public
router.get('/',(req,res)=>res.send('posts Route...'))

module.exports=router