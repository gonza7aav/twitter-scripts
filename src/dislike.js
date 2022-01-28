require('dotenv').config();

const RATE_LIMIT = 50;

const fs = require('node:fs/promises');
const got = require('got');
const crypto = require('crypto');
const OAuth = require('oauth-1.0a');

const oauth = OAuth({
  consumer: {
    key: process.env.CONSUMER_KEY,
    secret: process.env.CONSUMER_SECRET,
  },
  signature_method: 'HMAC-SHA1',
  hash_function: (baseString, key) =>
    crypto.createHmac('sha1', key).update(baseString).digest('base64'),
});

async function getRequest(options, { oauth_token, oauth_token_secret }) {
  const authHeader = oauth.toHeader(
    oauth.authorize(
      { url: options.url, method: options.method },
      { key: oauth_token, secret: oauth_token_secret }
    )
  );

  const req = await got[options.method.toLowerCase()](options.url, {
    headers: {
      Authorization: authHeader['Authorization'],
      'user-agent': options.userAgent,
    },
  });

  if (req.body) return JSON.parse(req.body);

  throw new Error('Unsuccessful request');
}

(async () => {
  try {
    // Read OAuth credentials
    console.log('Reading OAuth credentials');
    const oAuthAccessToken = JSON.parse(
      await fs.readFile(`./${process.env.USER_ID}.oauth`)
    );

    // Request liked tweets
    console.log(`Requesting liked tweets (MAX: ${RATE_LIMIT})`);
    const get_likes_response = await getRequest(
      {
        url: `https://api.twitter.com/2/users/${process.env.USER_ID}/liked_tweets?max_results=${RATE_LIMIT}`,
        method: 'GET',
        userAgent: 'v2LikedTweetsJS',
      },
      oAuthAccessToken
    );

    console.log('Starting to dislike tweets');
    let count = 0;
    for await (const tweet of get_likes_response.data) {
      try {
        // Dislike tweet
        const delete_like_response = await getRequest(
          {
            url: `https://api.twitter.com/2/users/${process.env.USER_ID}/likes/${tweet.id}`,
            method: 'DELETE',
            userAgent: 'v2UnlikeTweetJS',
          },
          oAuthAccessToken
        );

        if (delete_like_response.data.liked === false) {
          console.log(`  disliked tweet's id: ${tweet.id}`);
          count += 1;
        }
      } catch (e) {
        console.log(e);
      }
    }

    console.log(`\nTOTAL: ${count} tweets disliked`);
  } catch (e) {
    console.log(e);
  }

  process.exit();
})();
