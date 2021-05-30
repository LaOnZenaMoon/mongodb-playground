const express = require("express");
const mongoose = require("mongoose");
const {User, Blog} = require("../bin/models");
const {handleErrorResponse} = require("../common/commonUtils");
const blogApi = express.Router();

blogApi.get('/', async (req, res, next) => {
  try {
    const {page} = req.query;
    const pageSize = 10;

    const blogs = await Blog.find()
      .skip(parseInt(page) * pageSize)
      .limit(pageSize)
      .populate([
        {path: 'user'},
        {path: 'comments', populate: {path: 'user'}},
      ])
      .sort({updatedAt: -1});
    return res.send({blogs});
  } catch (e) {
    return handleErrorResponse(res, e);
  }
});

blogApi.get('/:blogId', async (req, res, next) => {
  try {
    const {blogId} = req.params;
    if (!mongoose.isValidObjectId(blogId)) {
      return res.status(400).send({message: 'blogId is invalid.'});
    }

    const [blog] = await Promise.all([
      Blog.findOne({_id: blogId}),
      // Comment.find({blog: blogId}).countDocuments(),
    ]);

    return res.send({
      blog,
      // commentCount
    });
  } catch (e) {
    return handleErrorResponse(res, e);
  }
});

blogApi.post('/', async (req, res) => {
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

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).send({message: 'userId is invalid.'});
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).send({message: 'User does not exist.'});
    }

    const blog = new Blog({
      ...req.body,
      user: user,
    });
    await blog.save();

    return res.send({success: true, blog});
  } catch (e) {
    return handleErrorResponse(res, e);
  }
});

blogApi.put('/:blogId', async (req, res, next) => {
  try {
    const {blogId} = req.params;
    if (!mongoose.isValidObjectId(blogId)) {
      return res.status(400).send({message: 'blogId is invalid.'});
    }

    const {title, content} = req.body;

    const blog = await Blog.findById(blogId);
    if (title) {
      blog.title = title;
    }
    if (content) {
      blog.content = content;
    }
    await blog.save();

    return res.send({blog});
  } catch (e) {
    return handleErrorResponse(res, e);
  }
});

blogApi.patch('/:blogId/live', async (req, res, next) => {
  try {
    const {blogId} = req.params;
    if (!mongoose.isValidObjectId(blogId)) {
      return res.status(400).send({message: 'blogId is invalid.'});
    }

    const {isLive} = req.body;
    if (typeof isLive !== 'boolean') {
      return res.status(400).send({message: 'isLive must be boolean.'});
    }

    const blog = await Blog.findByIdAndUpdate(blogId, {isLive}, {new: true});
    return res.send({blog});
  } catch (e) {
    return handleErrorResponse(res, e);
  }
});

blogApi.delete('/:blogId', async (req, res, next) => {
  try {
    const {blogId} = req.params;
    if (!mongoose.isValidObjectId(blogId)) {
      return res.status(400).send({message: 'blogId is invalid.'});
    }

    const blog = await Blog.findOneAndDelete({_id: blogId});
    return res.send({blog});
  } catch (e) {
    return handleErrorResponse(res, e);
  }
});

module.exports = {blogApi};
