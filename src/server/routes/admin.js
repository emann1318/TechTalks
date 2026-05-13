import express from 'express';
import User from '../models/User.js';
import Post from '../models/Post.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, adminOnly);

// View all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username email role active createdAt');
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Block/Disable user
router.post('/users/:id/toggle-active', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send();
    
    user.active = !user.active;
    await user.save();
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// List all blog posts with stats
router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate('author', 'username')
      .select('title author createdAt averageRating status');
    res.send(posts);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Disable/Enable blog post
router.post('/posts/:id/toggle-status', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send();

    post.status = post.status === 'active' ? 'blocked' : 'active';
    await post.save();
    res.send(post);
  } catch (error) {
    res.status(400).send(error);
  }
});

export default router;
