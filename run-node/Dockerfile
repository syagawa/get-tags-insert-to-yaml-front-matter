FROM node:20.14-slim

WORKDIR /app

RUN apt-get update \
    && apt-get -y install git vim

COPY package.json /app/package.json

RUN npm i

