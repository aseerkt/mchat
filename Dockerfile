FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
WORKDIR /usr/src/app

COPY pnpm-workspace.prod.yaml pnpm-workspace.yaml
COPY pnpm-lock.yaml .

COPY server/package.json server/package.json
COPY web/package.json web/package.json

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY . .
COPY server/.env.docker server/.env
COPY web/.env.docker web/.env

RUN NODE_ENV=production pnpm run -r build

RUN pnpm deploy --filter=server --prod /prod/server --ignore-scripts
RUN mv ./web /prod/web

FROM base AS app
WORKDIR /prod/app

COPY --from=build /prod/server .
COPY --from=build /prod/web/dist ./web/dist

RUN pnpm swag:gen

ENV NODE_ENV production

EXPOSE 5000

CMD [ "pnpm", "start" ]