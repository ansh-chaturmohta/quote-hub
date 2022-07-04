const express = require('express');
const router = express.Router()
const { ensureAuth } = require('../middleware/auth');

const Story = require('../models/Story')

//@desc Show add page
//@route GET /quotes/add
router.get('/add',ensureAuth,(req,res) => {
    res.render('quotes/add')
})

//@desc Process add page
//@route POST /quotes
router.post('/',ensureAuth,async (req,res) => {
    try{
        req.body.user = req.user.id
        await Story.create(req.body)
        // console.log(req.body)
        res.redirect('/dashboard')
    } catch(err){
        console.error(err);
        res.render('error/500')
    }
})

//@desc Show all quotes
//@route GET /quotes
router.get('/',ensureAuth,async(req,res) => {
    try{
        const stories = await Story.find({})
            .populate('user')
            .sort({createdAt: 'desc' })
            .lean()

        res.render('quotes/index',{
            stories,
        })
    } catch(err){
        console.error(err)
        res.render('error/500')
    }
})

//@desc Show single quote
//@route GET /quotes/:id
router.get('/:id',ensureAuth,async(req,res) => {
    try{
        let story = await Story.findById(req.params.id)
            .populate('user')
            .lean()

        if(!story){
            return res.render('error/404')
        }

        res.render('quotes/show',{
            story
        })

    } catch(err){
        console.error(err);
        res.render('error/404')
    }
})

//@desc Show edit page
//@route GET /quotes/edit/:id
router.get('/edit/:id',ensureAuth,async(req,res) => {
    
    try{
        const story = await Story.findOne({
            _id: req.params.id
        }).lean()
    
        if(!story){
            return res.render('error/404')
        }
        // console.log(`${req.user._id} ${story.user}`);
        if(story.user.toString() !== req.user._id.toString()){
            // console.log(`This place`);
            res.redirect('/dashboard')
        }
        else{
            res.render('quotes/edit',{
                story,
            })
        }
    } catch(err){
        console.error(err)
        res.render('error/500')
    }
    
    
})

//@desc Update quote
//@route PUT /quotes/:id
router.put('/:id',ensureAuth,async(req,res) => {
    

    try{
        let story = await Story.findById(req.params.id).lean()

        if(!story){
            return res.render('error/404')
        }
    
        if(story.user.toString() != req.user._id.toString()){
            res.redirect('/quotes')
        }
        else{
            story = await Story.findOneAndUpdate({
                _id: req.params.id
            },req.body,{
                new: true,
                runValidators: true
            })
    
            res.redirect('/dashboard')
        }
    } catch(err){
        console.error(err)
        res.render('error/500')
    }

    
})

//@desc Delete quote
//@route DELETE /quotes/:id
router.delete('/:id',ensureAuth,async(req,res) => {
    try{
        await Story.remove({
            _id:req.params.id
        })
        res.redirect('/dashboard')
    } catch(err){
        console.error(err)
        res.render('error/500')
    }
})

//@desc User quotes
//@route GET /quotes/user/:userId
router.get('/user/:userId',ensureAuth,async(req,res) => {
    try{
        const stories = await Story.find({
            user: req.params.userId,
        })
        .populate('user')
        .lean()

        res.render('quotes/index',{
            stories
        })
    } catch(err){
        console.error(err)
        res.render('error/500')
    }
})


module.exports = router