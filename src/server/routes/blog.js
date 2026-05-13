import express from 'express';
import mongoose from 'mongoose';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Create Post
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, body, category, difficulty, tags } = req.body;
    let tagList = tags;
    if (typeof tagList === 'string') {
      tagList = tagList.split(',').map((t) => t.trim()).filter(Boolean);
    }
    if (!Array.isArray(tagList)) tagList = [];

    const post = new Post({
      title,
      body,
      category,
      difficulty,
      tags: tagList,
      author: req.user._id,
    });
    await post.save();
    await post.populate('author', 'username avatar');
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || 'Could not create post' });
  }
});

// List Posts with filtering, sorting, pagination
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, author, minRating, startDate, endDate, sort, page = 1, limit = 10, search, excludeAuthor } = req.query;
    const query = { status: 'active' };

    if (category) query.category = category;
    if (author) query.author = author;
    else if (!req.user && excludeAuthor && mongoose.Types.ObjectId.isValid(excludeAuthor)) {
      query.author = { $ne: excludeAuthor };
    }
    if (minRating) query.averageRating = { $gte: parseFloat(minRating) };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (search) {
      query.$text = { $search: search };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'highest_rated') sortOption = { averageRating: -1 };
    if (sort === 'most_commented') sortOption = { commentCount: -1 };

    const posts = await Post.find(query)
      .populate('author', 'username avatar')
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Post.countDocuments(query);

    res.send({ posts, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get Single Post
router.get('/:id', async (req, res) => {
  try {
      const post = await Post.findById(req.params.id)
      .populate('author', 'username avatar bio followers')
      .populate('ratings.user', 'username');
    if (!post || (post.status === 'blocked')) {
      return res.status(404).send();
    }
    res.send(post);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update Post
router.put('/:id', authenticate, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, author: req.user._id });
    if (!post) return res.status(404).send({ error: 'Post not found or unauthorized' });

    Object.assign(post, req.body);
    await post.save();
    res.send(post);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete all posts by the authenticated user (comments removed first)
router.delete('/mine/all', authenticate, async (req, res) => {
  try {
    const ids = await Post.find({ author: req.user._id }).distinct('_id');
    if (ids.length) {
      await Comment.deleteMany({ post: { $in: ids } });
    }
    const result = await Post.deleteMany({ author: req.user._id });
    res.json({ deletedCount: result.deletedCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Could not delete posts' });
  }
});

// Delete Post
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid post id' });
    }
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    await Comment.deleteMany({ post: post._id });
    res.json(post);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Rate Post
router.post('/:id/rate', authenticate, async (req, res) => {
  try {
    const { score } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send();

    const existingRatingIndex = post.ratings.findIndex(r => r.user.toString() === req.user._id.toString());
    if (existingRatingIndex > -1) {
      post.ratings[existingRatingIndex].score = score;
    } else {
      post.ratings.push({ user: req.user._id, score });
    }
    await post.save();
    res.send(post);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Add Comment
router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const comment = new Comment({
      post: req.params.id,
      author: req.user._id,
      content: req.body.content
    });
    await comment.save();
    
    await Post.findByIdAndUpdate(req.params.id, { $inc: { commentCount: 1 } });
    
    res.status(201).send(comment);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get Comments
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 });
    res.send(comments);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Tag-based recommendation
router.get('/:id/recommendations', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send();

    const recommendations = await Post.find({
      _id: { $ne: post._id },
      status: 'active',
      tags: { $in: post.tags }
    })
    .limit(5)
    .populate('author', 'username avatar');

    // Simple sorting by number of shared tags could be added here if needed
    res.send(recommendations);
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;
