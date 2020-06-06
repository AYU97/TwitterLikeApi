const express = require('express')
const User = require('../models/User')
const auth = require('../middleware/auth')
const router = express.Router()

router.post('/api/signup', async (req, res) => {
    // Create a new user
    try {
        const user = new User(req.body)
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/api/login', async(req, res) => {
    //Login a registered user
    try {
        const { email, password } = req.body
        const user = await User.findByCredentials(email, password)
        if (!user) {
            return res.status(401).send({error: 'Login failed! Check authentication credentials'})
        }
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }

})

router.get('/api/user', auth, async(req, res) => {
    // View logged in user profile
    res.send(req.user)
})


router.get('/api/List',auth,async(req,res)=>{
    var userMap = {};
    try {
       const users =  await User.find({}, {'name': 1, 'email':1})
            users.forEach( (user) => {
	      if( user.id !== req.user.id )
                  userMap[user.name] = user;
            });

            res.send(userMap);
          }
    catch (error) {
        res.status(400).send(error)
    }
  })



router.post('/api/:user_id/follow',auth,(req,res)=>{

    if(req.body.id === req.params.user_id){
        return res.status(404).json({alreadyfollow : "you cant follow yourself"});
    }

    User.findById(req.params.user_id)
    .then(user=>{
        if(user.followers.filter(follower=>
            follower.user.toString()===req.body.id).length > 0){
                return res.status(404).json({alreadyfollow : "you are already following 1 "});
            }

            user.followers.unshift({user:req.body.id});
            user.save().then( () => {
                User.findOne({email : req.body.email}).then(user =>{
                    user.following.unshift({user : req.params.user_id});
                    user.save()
                    .then(user=> res.json(user))
                }).catch( err=> res.status(502).json({alreadyfollow : "you already following 2"}) );
            });

    })
})

module.exports = router
