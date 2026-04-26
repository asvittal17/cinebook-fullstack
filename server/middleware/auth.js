import { clerkClient } from '@clerk/clerk-sdk-node';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = await clerkClient.verifyToken(token);
    const clerkUser = await clerkClient.users.getUser(decoded.sub);

    let user = await User.findOne({ clerkId: clerkUser.id });

    if (!user) {
      user = await User.create({
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        name: `${clerkUser.firstName} ${clerkUser.lastName}`.trim(),
        imageUrl: clerkUser.imageUrl,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};

export const adminOnly = async (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
