// middleware/auth.js
import admin  from '../config/firebase.js';
import User from '../models/User.js';

async function verifyFirebaseToken(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing auth token' });
    }
    const idToken = header.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(idToken);

    // find or create user in MongoDB
    let user = await User.findOne({ uid: decoded.uid });
    if (!user) {
      user = await User.create({
        uid: decoded.uid,
        name: decoded.name || decoded.displayName || '',
        email: decoded.email || '',
        avatar: decoded.picture || ''
      });
    } else {
      // update info if changed
      const changed = (user.name !== decoded.name) || (user.email !== decoded.email) || (user.avatar !== decoded.picture);
      if (changed) {
        user.name = decoded.name || user.name;
        user.email = decoded.email || user.email;
        user.avatar = decoded.picture || user.avatar;
        await user.save();
      }
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth verify failed', err);
    return res.status(401).json({ message: 'Unauthorized', error: err.message });
  }
}

export default verifyFirebaseToken;
