FROM node:20-alpine AS base

WORKDIR /app

RUN npm i -g pnpm

COPY package.json .

RUN pnpm i

RUN pnpm swag:gen

COPY .env.docker .env

COPY . .

ENV NODE_ENV production

EXPOSE 5000

CMD ["pnpm", "start"]