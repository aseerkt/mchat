FROM node:20-alpine AS base

WORKDIR /app

RUN npm i -g pnpm

COPY package.json .

RUN pnpm i

COPY .env.docker .env

COPY . .

RUN pnpm build

RUN rm -rf src

ENV NODE_ENV production

EXPOSE 5000

CMD ["node", "dist/index.js"]