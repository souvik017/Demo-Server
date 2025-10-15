// routes/postRoutes.js
import { Router } from 'express';
const router = Router();
import multer, { memoryStorage } from 'multer';
const upload = multer({ storage: memoryStorage(), limits: { fileSize: 200 * 1024 * 1024 } }); // up to 200MB
import verifyFirebaseToken from '../middlewares/auth.js';
import { getPosts, createPost, updatePost, deletePost, getPostsByUser } from '../controllers/postController.js';

router.get('/', (req, res) => {
  if (req.query.userId) return getPostsByUser(req, res);
  return getPosts(req, res);
});
router.post('/', verifyFirebaseToken, upload.single('file'), createPost);
router.put('/:id', verifyFirebaseToken, upload.single('file'), updatePost);
router.delete('/:id', verifyFirebaseToken, deletePost);

export default router;
