const express = require('express');
const mongoose = require("mongoose");
const {User, Blog, Comment} = require("../bin/models");
const {isValidObjectId, startSession} = require("mongoose");
const {handleErrorResponse} = require("../common/commonUtils");
const commentApi = express.Router({mergeParams: true});

commentApi.get('/', async (req, res) => {
  try {
    const {blogId} = req.params;
    if (!isValidObjectId(blogId)) {
      return res.status(400).send({message: 'blogId is required.'});
    }

    const {page = 0} = req.query;
    const pageSize = 10;

    const comments = await Comment.find({blog: blogId})
      .skip(parseInt(page) * pageSize)
      .limit(pageSize)
      .sort({createdAt: -1});
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

    const comment = new Comment({
      content,
      blog: blogId,
      user,
      userFullName: `${user.name.first} ${user.name.last}`
    });

    blog.commentsCount++;
    blog.comments.push(comment);

    const pageSize = 10;
    if (blog.commentsCount > pageSize) {
      blog.comments.shift();
    }

    await Promise.all([
      comment.save(),
      // Blog.updateOne({_id: blogId}, {$push: {comments: comment}}),
      // Blog.updateOne({_id: blogId}, {$inc: {commentsCount: 1}}),
      blog.save(), // {session: transaction} 를 생략해도 된다. 위에서 find 시 트랜잭션 세션을 지정했기 때문이다
    ]);
    return res.send({success: true, comment});
  } catch (e) {
    return handleErrorResponse(res, e);
  }
});

commentApi.post('/atomic-update', async (req, res) => {
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

    const comment = new Comment({
      content,
      blog: blogId,
      user,
      userFullName: `${user.name.first} ${user.name.last}`
    });

    await Promise.all([
      comment.save(),
      blog.updateOne(
        {_id: blogId},
        {
          $inc: {commentsCount: 1},
          $push: {comments: {$each: [comment], $slice: -10}}
        }
      ),
    ]);
    return res.send({success: true, comment});
  } catch (e) {
    return handleErrorResponse(res, e);
  }
});

commentApi.post('/transaction', async (req, res) => {
  const transaction = await startSession();

  try {
    let comment;

    await transaction.withTransaction(async () => {
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
        Blog.findById(blogId, {}, {session: transaction}),
        User.findById(userId, {}, {session: transaction}),
      ]);

      if (!blog && !blog.isLive) {
        return res.status(400).send({message: 'blog does not exist.'});
      }
      if (!user) {
        return res.status(400).send({message: 'user does not exist.'});
      }

      const comment = new Comment({
        content,
        blog: blogId,
        user,
        userFullName: `${user.name.first} ${user.name.last}`
      });

      blog.commentsCount++;
      blog.comments.push(comment);

      const pageSize = 10;
      if (blog.commentsCount > pageSize) {
        blog.comments.shift();
      }

      if (false) {
        await transaction.abortTransaction(); // 트랜잭션 rollback 후 중단
      }

      await Promise.all([
        comment.save({session: transaction}),
        // Blog.updateOne({_id: blogId}, {$push: {comments: comment}}),
        // Blog.updateOne({_id: blogId}, {$inc: {commentsCount: 1}}),
        blog.save({session: transaction}), // {session: transaction} 를 생략해도 된다. 위에서 find 시 트랜잭션 세션을 지정했기 때문이다
      ]);
    });

    return res.send({success: true, comment});
  } catch (e) {
    return handleErrorResponse(res, e);
  } finally {
    transaction.endSession();
  }
});

commentApi.patch('/:commentId', async (req, res) => {
  try {
    const {commentId} = req.params;
    const {content} = req.body;
    if (typeof content !== 'string') {
      return res.status(400).send({message: 'content must be string.'});
    }

    const [comment, blog] = await Promise.all([
      Comment.findOneAndUpdate({_id: commentId}, {content}, {new: true}),
      // 조건에 충족하는 것이 $ 뒤에 선택이 된 것
      Blog.updateOne({'comments._id': commentId}, {'comments.$.content': content}),
    ]);

    return res.send({success: true, comment});
  } catch (e) {
    return handleErrorResponse(res, e);
  }
});

commentApi.delete('/:commentId', async (req, res) => {
  try {
    const {commentId} = req.params;
    const comment = await Comment.findOneAndDelete({_id: commentId});

    await Blog.updateOne({'comments._id': commentId}, {
      $pull: {
        comments: {
          $elemMatch: {
            content: 'hello',
            useFullName: 'jun lee'
          }
        }
      }
    });

    return res.send({success: true, comment});
  } catch (e) {
    return handleErrorResponse(res, e);
  }
});

module.exports = {commentApi};
