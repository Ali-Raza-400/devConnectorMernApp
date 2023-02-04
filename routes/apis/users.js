const express=require('express')
const router =express.Router()

//@route  api/users
//@desc   test routes
//@access public
router.get('/',(req,res)=>res.send('user Route...'))

module.exports=router