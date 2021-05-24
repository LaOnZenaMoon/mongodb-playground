const express = require('express');
const mongoose = require("mongoose");
const {handleErrorResponse} = require("../common/commonUtils");
const {User} = require("../bin/models/User");
const router = express.Router();

router.get('/', async function (req, res, next) {
  try {
    let users = await User.find();
    return res.send({users});
  } catch (e) {
    return handleErrorResponse(res, e);
  }
});

router.get('/:userId', async function (req, res, next) {
  try {
    const {userId} = req.params;
    if (mongoose.isValidObjectId(userId)) {
      return res.status(400).send({message: 'userId is invalid.'});
    }

    const user = await User.findOne({_id: userId});
    return res.send({user});
  } catch (e) {
    return handleErrorResponse(res, e);
  }
});

router.post('/', async function (req, res) {
  try {
    const {username, name} = req.body;
    if (!username) {
      return res.status(400).send({message: 'Username is required.'});
    }

    if (!name || !name.first || !name.last) {
      return res.status(400).send({message: 'Both first and last name is required.'});
    }

    const user = new User(req.body);
    await user.save();
    return res.send({success: true, user});
  } catch (e) {
    return handleErrorResponse(res, e);
  }
});

router.put('/:userId', async function (req, res, next) {
  try {
    const {userId} = req.params;
    if (mongoose.isValidObjectId(userId)) {
      return res.status(400).send({message: 'userId is invalid.'});
    }

    const {age, name} = req.body;
    if (!age) {
      return res.status(400).send({message: 'age is required.'});
    }

    if (typeof age !== 'number') {
      return res.status(400).send({message: 'age must be number.'});
    }

    if (!name) {
      return res.status(400).send({message: 'name is required.'});
    }

    // const updateBody = {};
    // if (age) {
    //   updateBody.age = age;
    // }
    // if (name) {
    //   updateBody.name = name;
    // }
    // const user = await User.findByIdAndUpdate(userId, {$set: updateBody}, {new: true});

    const user = User.findById(userId);
    if (age) {user.age = age;}
    if (name) {user.name = name;}
    await user.save();

    return res.send({user});
  } catch (e) {
    return handleErrorResponse(res, e);
  }
});

router.delete('/:userId', async function (req, res, next) {
  try {
    const {userId} = req.params;
    if (mongoose.isValidObjectId(userId)) {
      return res.status(400).send({message: 'userId is invalid.'});
    }

    const user = await User.findOneAndDelete({_id: userId});
    return res.send({user});
  } catch (e) {
    return handleErrorResponse(res, e);
  }
});

module.exports = router;
