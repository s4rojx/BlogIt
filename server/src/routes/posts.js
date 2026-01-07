import express from 'express';
import Post from '../models/Post.js';
import { authRequired } from '../middleware/auth.js';
import { validateInput, postSchema, commentSchema } from '../utils/validation.js';
import { sanitizeContent, sanitizeText } from '../utils/sanitization.js';

const router = express.Router();

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const getPaginationParams = (req) => {
  let page = parseInt(req.query.page, 10) || DEFAULT_PAGE;
  let limit = parseInt(req.query.limit, 10) || DEFAULT_LIMIT;

  page = Math.max(1, page);
  limit = Math.min(Math.max(1, limit), MAX_LIMIT);

  return { page, limit, skip: (page - 1) * limit };
};

router.get('/', async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req);

    const posts = await Post.find({ isPublished: true })
      .populate('author', '_id username avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCount = await Post.countDocuments({ isPublished: true });

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/mine', authRequired, async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req);

    const posts = await Post.find({ author: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCount = await Post.countDocuments({ author: req.userId });

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authRequired, validateInput(postSchema), async (req, res) => {
  try {
    const { title, content, isPublished = true } = req.validatedData;

    const post = await Post.create({
      title: sanitizeText(title),
      content: sanitizeContent(content),
      isPublished,
      author: req.userId,
    });

    res.status(201).json({ post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', '_id username avatarUrl');
    if (!post || !post.isPublished) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json({ post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authRequired, validateInput(postSchema), async (req, res) => {
  try {
    const { title, content, isPublished } = req.validatedData;

    const post = await Post.findOne({ _id: req.params.id, author: req.userId });
    if (!post) {
      return res.status(404).json({ message: 'Post not found or not owned by user' });
    }

    if (title !== undefined) post.title = sanitizeText(title);
    if (content !== undefined) post.content = sanitizeContent(content);
    if (isPublished !== undefined) post.isPublished = isPublished;

    await post.save();

    res.json({ post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authRequired, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, author: req.userId });
    if (!post) {
      return res.status(404).json({ message: 'Post not found or not owned by user' });
    }
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/like', authRequired, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || !post.isPublished) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.userId.toString();
    const hasLiked = post.likes.some((id) => id.toString() === userId);

    if (!hasLiked) {
      post.likes.push(userId);
      post.likeCount = post.likes.length;
      await post.save();
    }

    res.json({ likeCount: post.likeCount, liked: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/unlike', authRequired, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || !post.isPublished) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.userId.toString();
    post.likes = post.likes.filter((id) => id.toString() !== userId);
    post.likeCount = post.likes.length;
    await post.save();

    res.json({ likeCount: post.likeCount, liked: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id/comments', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('comments.author', 'username avatarUrl');
    if (!post || !post.isPublished) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json({ comments: post.comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/comments', authRequired, validateInput(commentSchema), async (req, res) => {
  try {
    const { content } = req.validatedData;

    const post = await Post.findById(req.params.id);
    if (!post || !post.isPublished) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({ author: req.userId, content: sanitizeText(content) });
    await post.save();

    const populated = await post.populate('comments.author', 'username avatarUrl');
    const latestComment = populated.comments[populated.comments.length - 1];

    res.status(201).json({ comment: latestComment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

