import 'dotenv/config';
import { logTime, loadOAuthCredentials, request } from './util.js';

const RATE_LIMIT = 50;

try {
  // Log the start time
  logTime();

  // Read OAuth credentials
  console.log('Reading OAuth credentials');
  const oAuthCredentials = await loadOAuthCredentials(process.env.USER_ID);

  // Request liked tweets
  console.log(`Requesting liked tweets (MAX: ${RATE_LIMIT})`);
  const { data: likedTweets } = await request(
    {
      url: `https://api.twitter.com/2/users/${process.env.USER_ID}/liked_tweets?max_results=${RATE_LIMIT}`,
      method: 'GET',
      userAgent: 'v2LikedTweetsJS',
    },
    oAuthCredentials
  );

  console.log('Starting to dislike tweets');
  let dislikedTweetsCount = 0;
  // eslint-disable-next-line no-restricted-syntax
  for await (const tweet of likedTweets) {
    try {
      // Request to dislike a tweet by its id
      const response = await request(
        {
          url: `https://api.twitter.com/2/users/${process.env.USER_ID}/likes/${tweet.id}`,
          method: 'DELETE',
          userAgent: 'v2UnlikeTweetJS',
        },
        oAuthCredentials
      );

      if (response.data.liked === false) {
        console.log(`  disliked ${tweet.id}`);
        dislikedTweetsCount += 1;
      }
    } catch (e) {
      console.log(`  failed to dislike ${tweet.id}`);
    }
  }

  console.log(`\nTOTAL: ${dislikedTweetsCount} tweets disliked`);
} catch (e) {
  console.error(e);
} finally {
  process.exit(0);
}
