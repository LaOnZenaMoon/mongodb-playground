const express = require("express");
const mongoose = require("mongoose");
const {User} = require("../bin/models/User");
const {handleErrorResponse} = require("../common/commonUtils");
const {Blog} = require("../bin/models/Blog");
const router = express.Router();

router.get('/', async function (req, res, next) {
  try {
    const blogs = await Blog.find();
    return res.send({blogs});
  } catch (e) {
    return handleErrorResponse(res, e);
  }
});

router.get('/:blogId', async function (req, res, next) {
  try {
    const {blogId} = req.params;
    if (mongoose.isValidObjectId(blogId)) {
      return res.status(400).send({message: 'blogId is invalid.'});
    }

    const blog = await Blog.findOne({_id: blogId});
    return res.send({blog});
  } catch (e) {
    return handleErrorResponse(res, e);
  }
});

router.post('/', async function (req, res) {
  try {
    const {title, content, isLive, userId} = req.body;
    if (typeof title !== 'string') {
      return res.status(400).send({message: 'title is invalid.'});
    }

    if (typeof content !== 'string') {
      return res.status(400).send({message: 'content is invalid.'});
    }

    if (isLive && typeof isLive !== 'boolean') {
      return res.status(400).send({message: 'isLive must be boolean.'});
    }

    if (mongoose.isValidObjectId(userId)) {
      return res.status(400).send({message: 'userId is invalid.'});
    }

    const user = User.findById(userId);
    if (!user) {
      return res.status(400).send({message: 'User does not exist.'});
    }

    const blog = new Blog({...req.body, user:userId});
    await blog.save();

    return res.send({success: true, blog});
  } catch (e) {
    return handleErrorResponse(res, e);
  }
});

router.put('/:blogId', async function (req, res, next) {
  try {
    const {blogId, title, content} = req.params;
    if (mongoose.isValidObjectId(blogId)) {
      return res.status(400).send({message: 'blogId is invalid.'});
    }

    const blog = Blog.findById(blogId);
    if (title) {blog.title = title;}
    if (content) {blog.content = content;}
    await blog.save();

    return res.send({blog});
  } catch (e) {
    return handleErrorResponse(res, e);
  }
});

router.patch('/:blogId/live', async function (req, res, next) {
  try {
    const {blogId, isLive} = req.params;
    if (mongoose.isValidObjectId(blogId)) {
      return res.status(400).send({message: 'blogId is invalid.'});
    }

    if (typeof isLive !== 'boolean') {
      return res.status(400).send({message: 'isLive must be boolean.'});
    }

    const blog = Blog.findByIdAndUpdate(blogId, {isLive}, {new: true});
    return res.send({blog});
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

    const blog = await Blog.findOneAndDelete({_id: userId});
    return res.send({blog});
  } catch (e) {
    return handleErrorResponse(res, e);
  }
});

module.exports = router;
