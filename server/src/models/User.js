import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    bio: { type: String, maxlength: 500 },
    avatarUrl: { type: String },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    location: { type: String },
    website: { type: String },
    profession: { type: String }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
