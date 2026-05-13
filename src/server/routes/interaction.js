import express from 'express';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/follow/:id', authenticate, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).send({ error: "You can't follow yourself." });
    }

    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) return res.status(404).send({ error: 'User not found.' });

    const alreadyFollowing = req.user.following.some(
      (id) => id.toString() === userToFollow._id.toString()
    );

    if (alreadyFollowing) {
      req.user.following = req.user.following.filter(
        (id) => id.toString() !== userToFollow._id.toString()
      );
      userToFollow.followers = userToFollow.followers.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      req.user.following.push(userToFollow._id);
      userToFollow.followers.push(req.user._id);

      await new Notification({
        recipient: userToFollow._id,
        type: 'follow',
        actor: req.user._id,
      }).save();
    }

    await req.user.save();
    await userToFollow.save();

    res.send({
      following: req.user.following,
      isFollowing: !alreadyFollowing,
    });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(400).send({ error: error.message });
  }
});


router.get('/feed', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip     = (pageNum - 1) * limitNum;

    const followedIds = req.user.following.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    const isFollowingAnyone = followedIds.length > 0;

    let query = isFollowingAnyone
      ? { author: { $in: followedIds }, status: 'active' }
      : { status: 'active' };

    let [posts, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'username avatar')
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .skip(skip),
      Post.countDocuments(query),
    ]);

    let isDiscover = !isFollowingAnyone;
    if (isFollowingAnyone && total === 0) {
      query = { status: 'active' };
      isDiscover = true;
      [posts, total] = await Promise.all([
        Post.find(query)
          .populate('author', 'username avatar')
          .sort({ createdAt: -1 })
          .limit(limitNum)
          .skip(skip),
        Post.countDocuments(query),
      ]);
    }

    res.send({
      posts,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      isDiscover,
    });
  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).send({ error: error.message });
  }
});

router.get('/suggestions', authenticate, async (req, res) => {
  try {
    const excluded = [...req.user.following, req.user._id];
    const suggestions = await User.find({ _id: { $nin: excluded }, active: true })
      .select('username avatar bio followers')
      .limit(5);
    res.send(suggestions);
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).send({ error: error.message });
  }
});

router.get('/notifications', authenticate, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('actor', 'username avatar')
      .populate('post', 'title')
      .sort({ createdAt: -1 })
      .limit(20);
    res.send(notifications);
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).send({ error: error.message });
  }
});

router.post('/notifications/read', authenticate, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );
    res.send({ success: true });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

export default router;