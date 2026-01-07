import express from 'express';
import FriendRequest from '../models/FriendRequest.js';
import User from '../models/User.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

router.post('/send', authRequired, async (req, res) => {
  try {
    const { recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ message: 'Recipient ID required' });
    }

    if (recipientId === req.userId.toString()) {
      return res.status(400).json({ message: 'Cannot send request to yourself' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existing = await FriendRequest.findOne({
      $or: [
        { sender: req.userId, recipient: recipientId },
        { sender: recipientId, recipient: req.userId }
      ]
    });

    if (existing) {
      return res.status(409).json({ message: 'Request already exists' });
    }

    const friendRequest = await FriendRequest.create({
      sender: req.userId,
      recipient: recipientId
    });

    await friendRequest.populate('sender', 'username avatarUrl');

    res.status(201).json({ message: 'Friend request sent', friendRequest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/pending', authRequired, async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      recipient: req.userId,
      status: 'pending'
    })
      .populate('sender', 'username avatarUrl bio')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/sent', authRequired, async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      sender: req.userId,
      status: 'pending'
    })
      .populate('recipient', 'username avatarUrl bio')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/accept', authRequired, async (req, res) => {
  try {
    const friendRequest = await FriendRequest.findById(req.params.id);

    if (!friendRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (friendRequest.recipient.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    friendRequest.status = 'accepted';
    await friendRequest.save();

    const sender = await User.findById(friendRequest.sender);
    const recipient = await User.findById(friendRequest.recipient);

    if (!sender.friends.some(f => f.toString() === friendRequest.recipient.toString())) {
      sender.friends.push(friendRequest.recipient);
      await sender.save();
    }

    if (!recipient.friends.some(f => f.toString() === friendRequest.sender.toString())) {
      recipient.friends.push(friendRequest.sender);
      await recipient.save();
    }

    res.json({ message: 'Friend request accepted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/reject', authRequired, async (req, res) => {
  try {
    const friendRequest = await FriendRequest.findById(req.params.id);

    if (!friendRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (friendRequest.recipient.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    await FriendRequest.deleteOne({ _id: req.params.id });

    res.json({ message: 'Friend request rejected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authRequired, async (req, res) => {
  try {
    const friendRequest = await FriendRequest.findById(req.params.id);

    if (!friendRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (friendRequest.sender.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await FriendRequest.deleteOne({ _id: req.params.id });

    res.json({ message: 'Friend request cancelled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
