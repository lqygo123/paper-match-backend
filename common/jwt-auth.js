const jwt = require('jsonwebtoken');

const secretKey = 'e9e1e9c8-5c30-11ee-8c99-0242ac120002';

const bypassRoutes = [];

const skipAuth = (req) => {
  let shouldSkip = false;
  bypassRoutes.forEach((route) => {
    if (req.path.startsWith(route)) {
      shouldSkip = true;
    }
  });
  return shouldSkip;
}

const generateToken = (payload) => {
  const token = jwt.sign(payload, secretKey, { expiresIn: '10y' });
  return token;
}

const jwtAuth = async (req, res, next) => {
  if (skipAuth(req)) {
    return next();
  }
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ code: 1, message: '请先登录' });
  }
  try {
    req.jwtPayload = jwt.verify(authHeader, secretKey);
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ code: 1, message: '无效的 JWT token' });
  }
};

module.exports = {
  generateToken,
  jwtAuth,
};