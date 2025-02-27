import fetch from 'node-fetch'; // Required for older Node versions
import dotenv from 'dotenv';
dotenv.config();

const testFetch = async () => {
  const code = '40eb2552153c68fc7dc2'; // Replace with a fresh GitHub code

  try {
    console.log('Before Fetching GitHub Token');

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    console.log('After Fetching GitHub Token');

    const tokenData = await tokenResponse.json();
    console.log('GitHub Token Response:', tokenData);

  } catch (error) {
    console.error('GitHub Fetch Failed:', error);
  }
};

testFetch();
