// src/controllers/postController.js
import Post from "../models/Post.js";
import User from "../models/User.js";
import redisClient from "../utils/redisClient.js";

const FEED_KEY = process.env.FEED_CACHE_KEY || "feed:recent";
const FEED_TTL = Number(process.env.FEED_CACHE_TTL || 10);

/**
 * GET /api/posts
 * Try cache first; if miss, query DB, cache, and return
 */
export async function getPosts(req, res) {
  try {
    const cached = await redisClient.get(FEED_KEY);
    if (cached) {
      const posts = JSON.parse(cached);
      return res.json({ source: "cache", posts });
    }

    const posts = await Post.find()
      .populate("user")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    await redisClient.set(FEED_KEY, JSON.stringify(posts), "EX", FEED_TTL);
    return res.json({ source: "db", posts });
  } catch (err) {
    console.error("getPosts error:", err);
    return res.status(500).json({ message: "Could not fetch posts" });
  }
}

/**
 * POST /api/posts
 * Accepts JSON body:
 * - userId (Firebase UID)
 * - content (text caption)
 * - mediaType ("text" | "image" | "video")
 * - imageUrl (optional)
 * - videoUrl (optional)
 */
export async function createPost(req, res) {
  try {
    const { userId, content, mediaType, imageUrl, videoUrl } = req.body;

    if (!userId) return res.status(400).json({ message: "User ID is required" });

    const user = await User.findOne({ uid: userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const postData = {
      user: user._id,
      content: content || "",
      mediaType: mediaType || "text",
      imageUrl: mediaType === "image" ? imageUrl || null : null,
      videoUrl: mediaType === "video" ? videoUrl || null : null,
      createdAt: new Date(),
    };

    const post = await Post.create(postData);
    await post.populate("user");

    // Invalidate cache
    await redisClient.del(FEED_KEY);

    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      io.emit("post:created", post);
      console.log("📢 post:created emitted");
    }

    return res.status(201).json(post);
  } catch (err) {
    console.error("createPost error:", err);
    return res
      .status(500)
      .json({ message: "Could not create post", error: err.message });
  }
}

/**
 * PUT /api/posts/:id
 * Updates content or mediaType
 */
export async function updatePost(req, res) {
  try {
    const { userId, content, mediaType, imageUrl, videoUrl } = req.body;
    const postId = req.params.id;

    if (!userId) return res.status(400).json({ message: "User ID is required" });

    const user = await User.findOne({ uid: userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.user.toString() !== user._id.toString())
      return res.status(403).json({ message: "Forbidden" });

    if (content !== undefined) post.content = content;
    if (mediaType) post.mediaType = mediaType;
    if (mediaType === "image") post.imageUrl = imageUrl || post.imageUrl;
    if (mediaType === "video") post.videoUrl = videoUrl || post.videoUrl;

    await post.save();
    await post.populate("user");

    await redisClient.del(FEED_KEY);

    const io = req.app.get("io");
    if (io) {
      io.emit("post:updated", post);
      console.log("📢 post:updated emitted");
    }

    return res.json(post);
  } catch (err) {
    console.error("updatePost error:", err);
    return res.status(500).json({ message: "Could not update post" });
  }
}

/**
 * DELETE /api/posts/:id
 */
export async function deletePost(req, res) {
  try {
    const { userId } = req.body;
    const postId = req.params.id;

    if (!userId) return res.status(400).json({ message: "User ID is required" });

    const user = await User.findOne({ uid: userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.user.toString() !== user._id.toString())
      return res.status(403).json({ message: "Forbidden" });

    // Fixed delete
    await post.deleteOne();

    await redisClient.del(FEED_KEY);

    const io = req.app.get("io");
    if (io) {
      io.emit("post:deleted", { _id: postId });
      console.log("📢 post:deleted emitted");
    }

    return res.json({ message: "Post deleted" });
  } catch (err) {
    console.error("deletePost error:", err);
    return res.status(500).json({ message: "Could not delete post" });
  }
}

/**
 * GET /api/posts?userId=<uid>
 * Fetch posts of a specific user
 */
export async function getPostsByUser(req, res) {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    // Find MongoDB user by Firebase UID
    const user = await User.findOne({ uid: userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch posts by this user
    const posts = await Post.find({ user: user._id })
      .populate("user")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ posts });
  } catch (err) {
    console.error("getPostsByUser error:", err);
    return res.status(500).json({ message: "Could not fetch posts" });
  }
}
