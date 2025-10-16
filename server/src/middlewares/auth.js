const jwt = require('jsonwebtoken');

function authRequired(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(Object.assign(new Error('Unauthorized'), { status: 401 }));
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch (e) {
    return next(Object.assign(new Error('Unauthorized'), { status: 401 }));
  }
}

function requireRole(role) {
  return (req, _res, next) => {
    if (!req.user || req.user.role !== role) {
      return next(Object.assign(new Error('Forbidden'), { status: 403 }));
    }
    return next();
  };
}

module.exports = { authRequired, requireRole };
