/* eslint-disable camelcase */

import { createInterface } from 'node:readline';
import { createHmac } from 'node:crypto';
import { parse } from 'node:querystring';
import { readFile, writeFile } from 'node:fs/promises';
import OAuth from 'oauth-1.0a';
import got from 'got';

const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const getInput = async (prompt) =>
  new Promise((resolve) => {
    readline.question(prompt, (answer) => {
      readline.close();
      resolve(answer);
    });
  });

const oauth = OAuth({
  consumer: {
    key: process.env.CONSUMER_KEY,
    secret: process.env.CONSUMER_SECRET,
  },
  signature_method: 'HMAC-SHA1',
  hash_function: (baseString, key) =>
    createHmac('sha1', key).update(baseString).digest('base64'),
});

export const request = async (options, { oauth_token, oauth_token_secret }) => {
  const authHeader = oauth.toHeader(
    oauth.authorize(
      { url: options.url, method: options.method },
      { key: oauth_token, secret: oauth_token_secret }
    )
  );

  const response = await got[options.method.toLowerCase()](options.url, {
    json: options.json,
    responseType: 'json',
    headers: {
      Authorization: authHeader.Authorization,
      'user-agent': options.userAgent,
      'content-type': 'application/json',
      accept: 'application/json',
    },
  });

  if (response.body) return response.body;

  throw new Error('Unsuccessful request');
};

export const requestToken = async () => {
  const authHeader = oauth.toHeader(
    oauth.authorize({
      url: 'https://api.twitter.com/oauth/request_token?oauth_callback=oob',
      method: 'POST',
    })
  );

  const response = await got.post(
    'https://api.twitter.com/oauth/request_token?oauth_callback=oob',
    {
      headers: {
        Authorization: authHeader.Authorization,
      },
    }
  );

  if (response.body) return parse(response.body);

  throw new Error('Cannot get an OAuth request token');
};

export const requestAccessToken = async ({ oauth_token }, verifier) => {
  const authHeader = oauth.toHeader(
    oauth.authorize({
      url: 'https://api.twitter.com/oauth/access_token',
      method: 'POST',
    })
  );

  const response = await got.post(
    `https://api.twitter.com/oauth/access_token?oauth_verifier=${verifier}&oauth_token=${oauth_token}`,
    {
      headers: {
        Authorization: authHeader.Authorization,
      },
    }
  );

  if (response.body) return parse(response.body);

  throw new Error('Cannot get an OAuth request token');
};

export const saveOAuthCredentials = async (credentials) =>
  writeFile(`./${credentials.user_id}.oauth`, JSON.stringify(credentials));

export const loadOAuthCredentials = async (userId) =>
  JSON.parse(await readFile(`./${userId}.oauth`));

export const logTime = () => {
  const now = new Date();
  console.log(now.toISOString());
};
