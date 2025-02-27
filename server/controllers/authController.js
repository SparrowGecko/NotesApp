require('dotenv').config();
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

// setup Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});

// generate JWT token (short-lived)
const generateToken = (userId) => {
  // jwt.sign(payload, secret, options), JWT store user information in id,
  // encrypy by secret key, expire in 7 days, return a JWT token
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

// generate refresh token (long-lived) to get new JWT token
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_SECRET, { expiresIn: '7d' });
}

// Github OAuth login function => redirect to github login page
const githubLogin = async (req, res, next) => {
  try {
    // contacts Google to start the login process
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      // after log in, google should redirect user back
      options: { redirectTo: 'http://localhost:8080/auth/callback' }

    });

    console.log('GitHub OAuth Login Response:', data, error); 

    if (error) {
      return next({
        log: `Github OAuth Error: ${error.message}`,
        // 400: Bad request, The server cannot or will not process the request 
        status: 400,
        message: { err: 'Github login failed' },
      });
    }
    console.log('Redirecting to GitHub OAuth:', data.url);

    // no error, Google login page is attached to data.url
    res.redirect(data.url);
  } catch (err) {
    return next(err);
  }
}

// github OAuth callback function => to handle response after log in
const githubCallback = async (req, res, next) => {
  try {
    console.log('OAuth Callback Query Params:', req.query);
  console.log('Full Request URL:', req.originalUrl);

  const { code, state } = req.query;

  if (!code) {
    console.error('GitHub OAuth callback failed: Missing code');
    return next({
      log: 'GitHub OAuth callback failed: Missing code',
      status: 400,
      message: { err: 'Missing authorization code' },
    });
  }
  if (!state) {
    console.error('GitHub OAuth callback failed: Missing state parameter');
    return next({
      log: 'GitHub OAuth callback failed: Missing state parameter',
      status: 400,
      message: { err: 'Missing state parameter' },
    });
  }
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);


    console.log('GitHub OAuth Callback - User Data:', data, error);

    if (error || !data?.user) {
      return next({
        log: 'Github OAuth callback failed: No valid session',
        // 401: Unauthorized, client need authenticate to get response
        status: 401,
        message: { err: 'Unauthorized' },
      });
    }

    const user = data.user;
    console.log('Authenticated GitHub User:', user);

    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // attach accessToken and refresh token to http-only cookie
    res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 }); // 15 min
    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days

    return res.redirect('/secret');
  } catch (err) {
    return next(err);
  }
};

const refreshAccessToken = (req, res, next) => {
  // deconstructure the refreshToken saved in cookies
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next({
      log: 'No refresh token provided',
      // 401: Unauthorized, client need authenticate to get response
      status: 401,
      message: { err: 'Authentication required' },
    });
  }

  jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, decoded) => {
    if (err) {
      return next({
        log: 'Invalid refresh token',
        // 403: Forbidden, client does not have access
        status: 403,
        message: { err: 'Invalid or expired refresh token' },
      });
    }
    // decode the token to get userid and regenerate JWT token
    const newAccessToken = generateToken(decoded.userId);
    // update the accessToken attached to res to be new one
    res.json({ accessToken: newAccessToken});
  });

}

const logout = async (req, res) => {
  await supabase.auth.signOut();
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
}

module.exports = { githubLogin, githubCallback, refreshAccessToken, logout };