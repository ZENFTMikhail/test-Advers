FROM node:18-bullseye

RUN curl https://install.meteor.com/ | sh

WORKDIR /app
COPY . /app

VOLUME /app/.meteor/local

CMD ["sh", "-c", "METEOR_WATCH_FORCE_POLLING=true METEOR_NO_UPDATE_CHECK=1 meteor run --settings settings.json"]

