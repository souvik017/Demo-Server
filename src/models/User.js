// models/User.js
import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  uid: { type: String, unique: true, index: true }, // firebase uid
  name: String,
  email: String,
  avatar: String
}, { timestamps: true });

export default model('User', userSchema);
