const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function protect(req, res, next) {
  let token;
  const authHeader = req.headers.authorization || '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'Not authorized' });
    req.user = { id: user._id };
    next();
  } catch (err) {
    console.error('[auth]', err.message);
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid' });
  }
};
