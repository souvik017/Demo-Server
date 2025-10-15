// models/Post.js
import { Schema, model } from 'mongoose';

const postSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },
  imageUrl: String,
  videoUrl: String,
  // a simple mediaType field might help (image, video, none)
  mediaType: { type: String, enum: ['image', 'video', 'text' ,null], default: null }
}, { timestamps: true });

export default model('Post', postSchema);
