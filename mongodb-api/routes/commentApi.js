const express = require('express');
const mongoose = require("mongoose");
const {User, Blog, Comment} = require("../bin/models");
const {isValidObjectId} = require("mongoose");
const {handleErrorResponse} = require("../common/commonUtils");
const commentApi = express.Router({mergeParams: true});

commentApi.get('/', async (req, res) => {
  try {
    const {blogId} = req.params;
    if (!isValidObjectId(blogId)) {
      return res.status(400).send({message: 'blogId is required.'});
    }

    const comments = await Comment.find({blog: blogId});
    return res.send({comments});
  } catch (e) {
    return handleErrorResponse(res, e);
  }
});

commentApi.post('/', async (req, res) => {
  try {
    const {blogId} = req.params;
    if (!isValidObjectId(blogId)) {
      return res.status(400).send({message: 'blogId is required.'});
    }
    const {content, userId} = req.body;
    if (!isValidObjectId(userId)) {
      return res.status(400).send({message: 'userId is required.'});
    }

    if (typeof content !== 'string') {
      return res.status(400).send({message: 'content must be string.'});
    }

    const [blog, user] = await Promise.all([
      Blog.findById(blogId),
      User.findById(userId),
    ]);

    if (!blog && !blog.isLive) {
      return res.status(400).send({message: 'blog does not exist.'});
    }
    if (!user) {
      return res.status(400).send({message: 'user does not exist.'});
    }

    const comment = new Comment({content, blog, user});
    await comment.save();
    return res.send({success: true, comment});
  } catch (e) {
    return handleErrorResponse(res, e);
  }
});

module.exports = {commentApi};
