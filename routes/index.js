const express = require('express');
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth');

const Story = require('../models/Story')

//@desc Login or landing page
//@route GET /
router.get('/',ensureGuest,(req,res) => {
    res.render('login',{
        layout: 'login',
    })
})

//@desc Dashboard
//@route GET /dashboard
router.get('/dashboard',ensureAuth,async(req,res) => {
    
    try{
        const stories = await Story.find({user:req.user.id}).lean()
        res.render('dashboard',{
            nameFirst: req.user.firstName,
            nameLast: req.user.lastName,
            userImage: req.user.image,
            stories
        })
    } catch(err){
        console.error(err)
        res.render('error/500')
    }
    
})

module.exports = router