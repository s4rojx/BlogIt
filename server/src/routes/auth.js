import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../models/User.js';
import { authRequired } from '../middleware/auth.js';
import { validateInput, registerSchema, loginSchema, userUpdateSchema } from '../utils/validation.js';
import { sanitizeText } from '../utils/sanitization.js';

const router = express.Router();

const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '2h',
  });
};

router.post('/register', validateInput(registerSchema), async (req, res) => {
  try {
    const { username, email, password } = req.validatedData;

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({ 
      username: sanitizeText(username),
      email: email.toLowerCase(),
      passwordHash
    });

    const token = createToken(user._id.toString());

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        theme: user.theme,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

router.post('/login', validateInput(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.validatedData;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = createToken(user._id.toString());

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        theme: user.theme,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/me', authRequired, validateInput(userUpdateSchema), async (req, res) => {
  try {
    const { bio, avatarUrl, location, website, profession, theme } = req.validatedData;

    const updates = {};
    if (bio !== undefined) updates.bio = sanitizeText(bio);

    // Handle avatar: if it's a data URL (base64), save to disk and store path
    if (avatarUrl !== undefined && typeof avatarUrl === 'string' && avatarUrl.length > 0) {
      const dataUrlMatch = avatarUrl.match(/^data:(image\/[a-zA-Z0-9+-\.]+);base64,(.+)$/);
      if (dataUrlMatch) {
        // User uploaded a new image as base64
        try {
          const mime = dataUrlMatch[1];
          const base64Data = dataUrlMatch[2];
          const buffer = Buffer.from(base64Data, 'base64');

          const maxBytes = 3 * 1024 * 1024; // 3MB limit
          if (buffer.length > maxBytes) {
            return res.status(400).json({ message: 'Avatar image is too large (max 3MB)' });
          }

          const __filename = fileURLToPath(import.meta.url);
          const __dirname = path.dirname(__filename);
          const uploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads');
          
          try {
            fs.mkdirSync(uploadsDir, { recursive: true });
          } catch (e) {
            console.error('Failed to ensure uploads dir:', e);
          }

          const ext = mime.split('/')[1].replace('+', '');
          const fileName = `${req.userId}-${Date.now()}.${ext}`;
          const filePath = path.join(uploadsDir, fileName);
          fs.writeFileSync(filePath, buffer);

          updates.avatarUrl = `/uploads/${fileName}`;
        } catch (e) {
          console.error('Avatar upload error:', e);
          return res.status(400).json({ message: 'Failed to process avatar image' });
        }
      } else {
        // Assume it's a regular URL or empty
        updates.avatarUrl = avatarUrl;
      }
    }

    if (location !== undefined) updates.location = sanitizeText(location);
    if (website !== undefined) updates.website = sanitizeText(website);
    if (profession !== undefined) updates.profession = sanitizeText(profession);
    if (theme !== undefined) updates.theme = theme;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true }
    ).select('-passwordHash');

    res.json({ user });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

