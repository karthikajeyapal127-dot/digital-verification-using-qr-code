import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const getJwtSecret = () => process.env.JWT_SECRET || 'veriglass_cryptographic_jwt_secret_key_2026_production';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, getJwtSecret());

      // Lookup real user from MongoDB
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found or token invalid' });
      }

      if (user.status === 'SUSPENDED') {
        return res.status(403).json({ success: false, message: 'Your account has been suspended' });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.warn('[authMiddleware] Token verification error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token verification failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

export const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, getJwtSecret());
      const user = await User.findById(decoded.id);
      if (user && user.status !== 'SUSPENDED') {
        req.user = user;
      }
    } catch (error) {
      // Non-fatal for optional authentication
    }
  }
  return next();
};

export const authorizeRoles = (...roles) => {
  const normalizedRoles = roles.map((r) => r.toUpperCase());
  return (req, res, next) => {
    const userRole = (req.user?.role || '').toUpperCase();
    if (!req.user || !normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `User role '${userRole || 'UNKNOWN'}' is not authorized to access this resource`
      });
    }
    next();
  };
};

export const generateToken = (id, role) => {
  return jwt.sign({ id, role: (role || 'USER').toUpperCase() }, getJwtSecret(), { expiresIn: '30d' });
};
