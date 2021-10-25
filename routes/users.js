const router = require('express').Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')

// update user
router.put('/:id', async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10)
        req.body.password = await bcrypt.hash(req.body.password, salt)
      } catch (err) {
        res.status(500).json({ error: err })
      }
    }

    try {
      await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      })
      const updatedUser = await User.findOne({_id: req.params.id})
      res.status(200).json(updatedUser)
    } catch (err) {
      res.status(500).json({ error: err })
    }
  } else {
    return res.status(403).json('You can only update your account!')
  }
})


// delete user
router.delete('/:id', async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const deletedUser = await User.findByIdAndDelete(req.params.id)
      res.status(200).json(deletedUser)
    } catch (err) {
      return res.status(500).json(err)
    }
  } else {
    return res.status(403).json('You can delete only your account')
  }
})


// get a user
router.get('/:id', async (req, res) => {
  try {
    const foundUser = await User.findOne({_id: req.params.id})

    if (!foundUser) {
      res.status(404).json('user not found')
    }

    const { password, updatedAt, ...other } = foundUser._doc

    res.status(200).json(other)
  } catch (err) {
    res.status(500).json({ error: err })
  }
})

// follow a user
router.put('/:id/follow', async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id)
      const currentUser = await User.findById(req.body.userId)

      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId }})
        await currentUser.updateOne({ $push: { followings: req.params.id }})

        const updatedUser = await User.findOne({_id: req.body.userId})
        const updatedCurrentUser = await User.findOne({_id: req.params.id})

        res.status(200).json({updatedUser, updatedCurrentUser})
      } else {
        await user.updateOne({ $pull: { followers: req.body.userId }})
        await currentUser.updateOne({ $pull: { followings: req.params.id }})

        const updatedUser = await User.findOne({_id: req.body.userId})
        const updatedCurrentUser = await User.findOne({_id: req.params.id})

        res.status(200).json({updatedUser, updatedCurrentUser})
      }
    } catch (err) {
      res.status(500).json(err)
    }
  } else {
    res.status(403).json(`You can't follow yourself`)
  }
})

// get a user
router.get('/followers/:id', async (req, res) => {
  let allFollowers = []

  try {
    const user = await User.findOne({_id: req.params.id})

    if (!user) {
      res.status(404).json('user not found')
    }

    for (let followerID of user.followers) {
      const follower = await User.findOne({_id: followerID})
      allFollowers = [...allFollowers, follower]
    }

    res.status(200).json(allFollowers)
  } catch (err) {
    res.status(500).json({ error: err })
  }
})


module.exports = router;