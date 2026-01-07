import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isPublished: { type: Boolean, default: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likeCount: { type: Number, default: 0 },
    comments: [commentSchema]
  },
  { timestamps: true }
);

const Post = mongoose.model('Post', postSchema);

export default Post;
