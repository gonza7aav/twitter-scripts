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

#### Docker

You can run a _Docker_ container with a cronjob to dislike tweets every 20 minutes [^1]. For more information see [Dockerfile](Dockerfile) and [cronfile](src/cronfile).

```bash
docker run --detach \
  --env CONSUMER_KEY=XXX \
  --env CONSUMER_SECRET=XXX \
  --env USER_ID=XXX \
  gonza7aav/twitter-scripts-dislike:0.2.0
```

Remember, to dislike tweets you need the `.oauth` file. So you could enter the container and run the oauth script to get the credentials, or if you already have one, copy it to the `/app` folder.

[^1]: Change `RATE_LIMIT` according to your app's rate limit.
