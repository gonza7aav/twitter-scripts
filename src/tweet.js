import 'dotenv/config';
import { getInput, loadOAuthCredentials, request } from './util.js';

try {
  // Read OAuth credentials
  console.log('Reading OAuth credentials');
  const oAuthCredentials = await loadOAuthCredentials(process.env.USER_ID);

  // Get the tweet content
  const tweetContent = await getInput("What's happening? ");

  // Send the tweet
  const response = await request(
    {
      url: 'https://api.twitter.com/2/tweets',
      method: 'POST',
      userAgent: 'v2CreateTweetJS',
      json: { text: tweetContent },
    },
    oAuthCredentials
  );

  console.log(response);
} catch (e) {
  console.error(e);
}
