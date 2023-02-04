const express=require('express')
const router =express.Router()

//@route  api/profile
//@desc   test routes
//@access public
router.get('/',(req,res)=>res.send('profile Route...'))

module.exports=router