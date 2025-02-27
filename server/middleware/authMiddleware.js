const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
  // deconstructure the accessToken from cookies
  const { accessToken } = req.cookies;
  console.log("accessToken:", accessToken);
  if (!accessToken) {
    return next({
      log: 'No access token provided',
      // 401: Unauthorized, client need authenticate to get response
      status: 401,
      message: { err: 'Access denied, not authenticated' },
    });
  }
  // verify if the token match with JWT_SECRET
  jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next({
        log: 'Invalid or expired token provided',
        // 403: Forbidden, client does not have access
        status: 403,
        message: { err: 'Valid token required' },
      });
    }
    // decoded userId attach to req.user
    req.user = decoded;
    console.log("Authenticated user:", req.user);
    next();
  });
};

module.exports = { authenticateUser };