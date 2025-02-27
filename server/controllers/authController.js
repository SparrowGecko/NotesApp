
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch'; // Required for older Node versions
import dotenv from 'dotenv';
dotenv.config();

// generate JWT token (short-lived)
const generateToken = (userId) => {
  // jwt.sign(payload, secret, options), JWT store user information in id,
  // encrypy by secret key, expire in 7 days, return a JWT token
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

// generate refresh token (long-lived) to get new JWT token
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_SECRET, {
    expiresIn: '7d',
  });
};

// Github OAuth login function => redirect to github login page
const githubLogin = async (req, res, next) => {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID; 
    const redirectUri = 'http://localhost:8080/auth/callback';
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=user:email`;

    console.log('Redirecting to GitHub OAuth:', githubAuthUrl);
    // res.redirect(`http://localhost:8080/`);
    res.redirect(githubAuthUrl);
  } catch (err) {
    return next(err);
  }
};

// github OAuth callback function => to handle response after log in
const githubCallback = async (req, res, next) => {
  // const controller = new AbortController();
  // const timeout = setTimeout(() => controller.abort(), 5000); 
  try {
    const { code } = req.query;
    console.log('GitHub Code:', code);
    if (!code) {
      return next({ status: 400, message: 'Missing authorization code' });
    }

    console.log("before tokenResponse: ");
    console.log('GitHub Code:', code); 
  console.log('Client ID:', process.env.GITHUB_CLIENT_ID);
  console.log('Client Secret:', process.env.GITHUB_CLIENT_SECRET);

    // POST to get a JSON include access_token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
      // signal: controller.signal,
    });
    console.log('Fetch Completed'); 
  //   clearTimeout(timeout); // Clear timeout if request completes
  // console.log('Fetch Completed');
    // .catch(err => {
    //   console.error("Fetch Error:", err);
    //   throw new Error('Failed to contact GitHub API');
    // }).finally(clearTimeout(timeout)); 

    if (!tokenResponse.ok) {
      console.error('GitHub OAuth token request failed:', tokenResponse.status, tokenResponse.statusText);
      const errorText = await tokenResponse.text(); // Read response as text to see errors
      console.error('Error details:', errorText);
      return next({
        log: 'GitHub OAuth token request failed',
        status: tokenResponse.status,
        message: { err: 'GitHub OAuth token request failed' },
      });
    }

    // console.log("Token Response Status:", tokenResponse.status);
    // console.log("Token Response Headers:", tokenResponse.headers);
    // get access_token
    const tokenData = await tokenResponse.json();
    console.log("tokenData: ", tokenData);
    if (!tokenData.access_token) {
      return next({ status: 401, message: 'Failed to get GitHub access token' });
    }

    // send request to github/user with access_token to get information
    const userResponse = await fetch('https://api.github.com/user', {
      headers: { Authorization: `token ${tokenData.access_token}` },
    });

    const userData = await userResponse.json();
    // console.log("userData: ",userData);
    if (!userData.id) {
      return next({ status: 401, message: 'Failed to get GitHub user data' });
    }

    // console.log('GitHub User Data:', userData);

    const accessToken = generateToken(userData.id);
    const refreshToken = generateRefreshToken(userData.id);

    // attach accessToken and refresh token to http-only cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
    }); // 15 min
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }); // 7 days

    return res.redirect('http://localhost:3000/profile');
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
    res.json({ accessToken: newAccessToken });
  });
};

const logout = async (req, res) => {
  // await supabase.auth.signOut();
  res.cookie('accessToken', '', { httpOnly: true, maxAge: 0 });
  res.cookie('refreshToken', '', { httpOnly: true, maxAge: 0 });
  req.session.forceLogin = true;
  res.redirect('https://github.com/logout?return_to=https://github.com/login');
  // res.json({ message: 'Logged out successfully' });
  
};

export { githubLogin, githubCallback, refreshAccessToken, logout };
