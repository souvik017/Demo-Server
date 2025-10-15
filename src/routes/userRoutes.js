// routes/userRoutes.js
import { Router } from 'express';
const router = Router();
import verifyFirebaseToken from '../middlewares/auth.js';

router.get('/me', verifyFirebaseToken, (req, res) => {
  res.json({ user: req.user });
});

export default router;
