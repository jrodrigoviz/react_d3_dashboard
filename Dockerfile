FROM node:8.7.0-alpine

MAINTAINER jrodrigoviz@gmail.com

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./

COPY . ./

RUN npm install

RUN npm run build



