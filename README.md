# twitter-scripts

Some scripts I use to interact the **_Twitter_ API**.

## Usage

### Environment Variables

Get your app's key from **_Twitter_ Developer Platform**

- CONSUMER_KEY
- CONSUMER_SECRET
- USER_ID

### OAuth Credentials

This will prompt an URL to authorize the app

```bash
npm run oauth
```

Then you will have an `.oauth` file with your credentials.

### Tweet Something

This will tweet whatever you write in the console. This require the `.oauth` file.

```bash
npm run tweet
```

### Dislike Tweets

This will dislike your last 50 (user rate limit per 15-minute window) tweets. This require the `.oauth` file.

```bash
npm run dislike
```
