FROM node:20-alpine AS base

WORKDIR /app

RUN npm i -g pnpm

COPY package.json .

RUN pnpm i

COPY .env.docker .env

COPY . .

RUN pnpm build



FROM node:20-alpine

WORKDIR /app

COPY --from=base /app/dist ./dist

RUN npm i -g serve

ENV NODE_ENV production

EXPOSE 3000

CMD [ "serve", "-s", "dist" ]