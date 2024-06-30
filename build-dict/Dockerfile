# FROM node:11.15-slim
FROM node:10.24.0-slim

WORKDIR /app

RUN echo "deb http://archive.debian.org/debian/ stretch main" > /etc/apt/sources.list \
    && echo "deb http://archive.debian.org/debian-security stretch/updates main" >> /etc/apt/sources.list \
    && apt-get update \
    && apt-get -y install git vim

RUN git clone https://github.com/takuyaa/kuromoji.js.git

RUN cd ./kuromoji.js && \
    rm package-lock.json && \
    npm i

WORKDIR /app/kuromoji.js
