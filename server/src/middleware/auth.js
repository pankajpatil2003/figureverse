const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'figure_verse_super_secret_jwt_key_2026';

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    const token = header.slice(7).trim();
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (_err) {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
}

function requireAuth(req, res, next) {
  optionalAuth(req, res, () => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required. Please sign in.' });
    }
    next();
  });
}

function requireAdmin(req, res, next) {
  optionalAuth(req, res, () => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    next();
  });
}

module.exports = {
  JWT_SECRET,
  signToken,
  optionalAuth,
  requireAuth,
  requireAdmin
};
