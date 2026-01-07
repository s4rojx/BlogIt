import express from 'express';
import User from '../models/User.js';
import { authRequired } from '../middleware/auth.js';
import { sanitizeText } from '../utils/sanitization.js';
import FriendRequest from '../models/FriendRequest.js';

const router = express.Router();

const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

router.get('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid user ID' });

    const user = await User.findById(req.params.id)
      .select('-passwordHash')
      .populate('friends', 'username avatarUrl');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let friendStatus = null;
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const currentUserId = decoded.userId;

        const isFriend = user.friends.some(f => f._id.toString() === currentUserId);
        
        if (isFriend) {
          friendStatus = 'friends';
        } else {
          const request = await FriendRequest.findOne({
            $or: [
              { sender: currentUserId, recipient: req.params.id },
              { sender: req.params.id, recipient: currentUserId }
            ]
          });

          if (request) {
            if (request.sender.toString() === currentUserId) {
              friendStatus = 'request_sent';
            } else {
              friendStatus = 'request_received';
            }
          }
        }
      } catch (err) {
      }
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        theme: user.theme,
        location: user.location,
        website: user.website,
        profession: user.profession,
        friendsCount: user.friends.length,
        friends: user.friends
      },
      friendStatus
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id/friends', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid user ID' });

    const user = await User.findById(req.params.id)
      .populate('friends', 'username avatarUrl bio profession');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ friends: user.friends });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.length < 2) {
      return res.status(400).json({ message: 'Search query too short' });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    })
      .select('username email avatarUrl bio profession')
      .limit(20);

    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

