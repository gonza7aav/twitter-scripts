import 'dotenv/config';
import {
  requestToken,
  getInput,
  requestAccessToken,
  saveOAuthCredentials,
} from './util.js';

try {
  // Request OAuth token
  const oAuthToken = await requestToken();

  // Authorize the app
  const authorizeURL = new URL('https://api.twitter.com/oauth/authorize');
  authorizeURL.searchParams.append('oauth_token', oAuthToken.oauth_token);
  console.log('Please go here and authorize:');
  console.log(authorizeURL.href);
  const pin = await getInput('Paste the PIN here: ');

  // Request access token
  const oAuthAccessToken = await requestAccessToken(oAuthToken, pin.trim());

  // Save the credentials
  console.log('Saving OAuth credentials');
  await saveOAuthCredentials(oAuthAccessToken);
} catch (e) {
  console.error(e);
}
