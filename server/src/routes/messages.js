import express from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { authRequired } from '../middleware/auth.js';
import { sanitizeText } from '../utils/sanitization.js';

const router = express.Router();

const areFriends = async (userId, otherUserId) => {
  const user = await User.findById(userId);
  return user && user.friends.some(friendId => friendId.toString() === otherUserId.toString());
};

router.post('/send', authRequired, async (req, res) => {
  try {
    const { recipientId, content } = req.body;

    if (!recipientId || !content) {
      return res.status(400).json({ message: 'Recipient and content required' });
    }

    const isFriend = await areFriends(req.userId, recipientId);
    if (!isFriend) {
      return res.status(403).json({ message: 'You can only message friends' });
    }

    const message = await Message.create({
      sender: req.userId,
      recipient: recipientId,
      content: sanitizeText(content)
    });

    await message.populate('sender', '_id username avatarUrl');

    res.status(201).json({ message });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/with/:userId', authRequired, async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    const isFriend = await areFriends(req.userId, userId);
    if (!isFriend) {
      return res.status(403).json({ message: 'You can only view messages with friends' });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.userId, recipient: userId },
        { sender: userId, recipient: req.userId }
      ]
    })
      .populate('sender', '_id username avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    await Message.updateMany(
      { sender: userId, recipient: req.userId, isRead: false },
      { isRead: true }
    );

    res.json({ messages: messages.reverse() });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/conversations', authRequired, async (req, res) => {
  try {
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.userId },
            { recipient: req.userId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.userId] },
              '$recipient',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      },
      {
        $limit: 50
      }
    ]);

    const conversationIds = messages.map(m => m._id);
    const users = await User.find({ _id: { $in: conversationIds } })
      .select('username avatarUrl bio');

    const conversations = messages.map(msg => {
      const user = users.find(u => u._id.toString() === msg._id.toString());
      return {
        user,
        lastMessage: msg.lastMessage.content,
        lastMessageTime: msg.lastMessage.createdAt,
        isRead: msg.lastMessage.isRead || msg.lastMessage.sender.toString() === req.userId.toString()
      };
    });

    res.json({ conversations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/unread', authRequired, async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      recipient: req.userId,
      isRead: false
    });

    res.json({ unreadCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
