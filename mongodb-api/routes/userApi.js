const express = require('express');
const mongoose = require("mongoose");
const {Blog} = require("../bin/models");
const {handleErrorResponse} = require("../common/commonUtils");
const {User} = require("../bin/models");
const userApi = express.Router();

userApi.get('/', async (req, res, next) => {
  try {
    let users = await User.find();
    return res.send({users});
  } catch (e) {
    return handleErrorResponse(res, e);
  }
});

userApi.get('/:userId', async (req, res, next) => {
  try {
    const {userId} = req.params;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).send({message: 'userId is invalid.'});
    }

    const user = await User.findOne({_id: userId});
    return res.send({user});
  } catch (e) {
    return handleErrorResponse(res, e);
  }
});

userApi.post('/', async (req, res) => {
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

userApi.put('/:userId', async (req, res, next) => {
  try {
    const {userId} = req.params;
    if (!mongoose.isValidObjectId(userId)) {
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

    const user = await User.findById(userId);
    if (age) {
      user.age = age;
    }

    if (name) {
      user.name = name;

      await Promise.all([
        Blog.updateMany({'user._id': userId}, {'user.n`   ame': name}),
        Blog.updateMany(
          {},
          {'comments.$[comment].userFullName': `${name.first} ${name.last}`}, // $[comment]: comment 객체 자체를 의미
          {arrayFilters: [{'comment.user._id': userId}]}
        ),
      ]);
    }

    user.save();

    return res.send({user});
  } catch (e) {
    return handleErrorResponse(res, e);
  }
});

userApi.delete('/:userId', async (req, res, next) => {
  try {
    const {userId} = req.params;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).send({message: 'userId is invalid.'});
    }

    const [user] = await Promise.all([
      await User.findOneAndDelete({_id: userId}),
      await Blog.deleteMany({'user._id': userId}),
      await Blog.updateMany({'comments.user': userId}, {$pull: {comments: {user: userId}}}),
      await Blog.deleteMany({user: userId}),
    ]);

    return res.send({user});
  } catch (e) {
    return handleErrorResponse(res, e);
  }
});

module.exports = {userApi};
