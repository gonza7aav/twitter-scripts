require('dotenv').config();

const fs = require('node:fs/promises');
const got = require('got');
const crypto = require('crypto');
const OAuth = require('oauth-1.0a');
const qs = require('querystring');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

const oauth = OAuth({
  consumer: {
    key: process.env.CONSUMER_KEY,
    secret: process.env.CONSUMER_SECRET,
  },
  signature_method: 'HMAC-SHA1',
  hash_function: (baseString, key) =>
    crypto.createHmac('sha1', key).update(baseString).digest('base64'),
});

async function input(prompt) {
  return new Promise(async (resolve, reject) => {
    readline.question(prompt, (out) => {
      readline.close();
      resolve(out);
    });
  });
}

async function requestToken() {
  const authHeader = oauth.toHeader(
    oauth.authorize({
      url: 'https://api.twitter.com/oauth/request_token?oauth_callback=oob',
      method: 'POST',
    })
  );

  const req = await got.post('https://api.twitter.com/oauth/request_token?oauth_callback=oob', {
    headers: {
      Authorization: authHeader['Authorization'],
    },
  });
  if (req.body) {
    return qs.parse(req.body);
  } else {
    throw new Error('Cannot get an OAuth request token');
  }
}

async function accessToken({ oauth_token, oauth_token_secret }, verifier) {
  const authHeader = oauth.toHeader(
    oauth.authorize({
      url: 'https://api.twitter.com/oauth/access_token',
      method: 'POST',
    })
  );
  const path = `https://api.twitter.com/oauth/access_token?oauth_verifier=${verifier}&oauth_token=${oauth_token}`;
  const req = await got.post(path, {
    headers: {
      Authorization: authHeader['Authorization'],
    },
  });
  if (req.body) {
    return qs.parse(req.body);
  } else {
    throw new Error('Cannot get an OAuth request token');
  }
}

(async () => {
  try {
    // Get request token
    const oAuthRequestToken = await requestToken();

    // Get authorization
    const authorizeURL = new URL('https://api.twitter.com/oauth/authorize');
    authorizeURL.searchParams.append(
      'oauth_token',
      oAuthRequestToken.oauth_token
    );
    console.log('Please go here and authorize:', authorizeURL.href);
    const pin = await input('Paste the PIN here: ');

    // Get the access token
    const oAuthAccessToken = await accessToken(oAuthRequestToken, pin.trim());

    await fs.writeFile(
      `./${process.env.USER_ID}.oauth`,
      JSON.stringify(oAuthAccessToken)
    );
  } catch (e) {
    console.log(e);
  }

  process.exit();
})();
