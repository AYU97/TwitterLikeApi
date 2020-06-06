const express = require('express')
const mongoose = require('mongoose')
const Post = require('../models/Post')
const User = require('../models/User')
const auth = require('../middleware/auth')
const router = express.Router()


router.post('/api/post', auth, async (req, res) => {
    const post = new Post({
        ...req.body,
        owner: req.user._id
    })

    try {
        await post.save()
        res.status(201).send(post)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/api/following/post/:user_id', auth, async (req, res) => {

    const user_id = req.params.user_id;

    const new_id = mongoose.Types.ObjectId(user_id)
    const user = await User.findById(new_id)
    const follow_id = user.following.map(obj => {
        return mongoose.Types.ObjectId(obj.user)
    })

    try{
        const post = await (await Post.find({ owner: { $in: follow_id } } ,{'post': 1, 'owner':1,'createdAt':1}).
        limit(7).sort({createdAt :-1})) 
        res.status(200).send(post)
    }
    catch (e) {
        res.status(500).send()
    }

  
})


router.get('/api/post', auth, async (req, res) => {
    try {
        const post = await Post.find({ owner: req.user._id })

        if (!post) {
            return res.status(404).send()
        }

        res.send(post)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router