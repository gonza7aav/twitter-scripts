FROM node:fermium-alpine3.14

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY src/cronfile /var/spool/cron/crontabs/root

CMD [ "crond", "-l", "2", "-f" ]
