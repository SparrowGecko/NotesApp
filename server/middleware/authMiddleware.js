const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
  // deconstructure the accessToken from cookies
  const { accessToken } = req.cookies;
  if (!accessToken) {
    return next({
      log: 'No access token provided',
      // 401: Unauthorized, client need authenticate to get response
      status: 401,
      message: { err: 'Access denied, not authenticated' },
    });
  }
  // verify if the token match with JWT_SECRET
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next({
        log: 'Invalid or expired token provided',
        // 403: Forbidden, client does not have access
        status: 403,
        message: { err: 'Valid token required' },
      });
    }
    // decoded userId attach to req.user
    req.user = decoded.userId;
    next();
  });
};

module.exports = { authenticateUser };