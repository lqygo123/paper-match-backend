const jwt = require('jsonwebtoken');

const secretKey = 'e9e1e9c8-5c30-11ee-8c99-0242ac120002';

const bypassRoutes = ['/api/v1/user/login', '/api/v1/file', '/static'];

let activeTokens = {};

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
  // Remove any old tokens for the user
  if (activeTokens[payload.userId]) {
    delete activeTokens[payload.userId];
  }
  // Add the new token to the list of active tokens
  activeTokens[payload.userId] = token;
  return token;
}

const jwtAuth = async (req, res, next) => {

  console.log('jwtAuth', req.path, req.method)
  if (skipAuth(req)) {
    return next();
  }
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ code: 1, message: '请先登录' });
  }
  try {
    const payload = jwt.verify(authHeader, secretKey);
    // Check if the token is in the list of active tokens
    if (activeTokens[payload.userId] !== authHeader) {
      throw new Error('登录已经失效，请重新登录');
    }
    req.jwtPayload = payload;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ code: 1, message: err.message });
  }
};

module.exports = {
  generateToken,
  jwtAuth,
};