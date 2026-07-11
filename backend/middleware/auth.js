const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const authHeader = req.headers.authorization; // expects "Bearer <token>"
  if (!authHeader) return res.status(401).json({ error: 'No token, access denied' });

  const token = authHeader.split(' ')[1]; // remove "Bearer " prefix
  if (!token) return res.status(401).json({ error: 'No token, access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // attach user id to request so routes can use it
    next(); // move on to the actual route
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = auth;