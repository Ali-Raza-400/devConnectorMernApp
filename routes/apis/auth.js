const express=require('express')
const router =express.Router()

//@route  api/auth
//@desc   test routes
//@access public
router.get('/',(req,res)=>res.send('auth Route...'))

module.exports=router