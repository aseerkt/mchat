# mChat

> Real-time messenger powered by Socket.IO


## Pre requisites

- Node.js v20
- PNPM
- Docker

## Tech Stacks

- Frontend - React.js, TailwindCSS
- Backend - Express, socket.io, MongoDB, Redis

## Get Started

### Run final build using docker compose

- Spin up entire stack (redis, mongo, client, server)
```bash
docker compose -f docker-compose.prod.yml up
```
- Go to [http://localhost:3000](http://localhost:3000)

### Development

- Spin up MongoDB and Redis
```bash
docker compose up -d
```

> Make sure the ports (mongo: 27017, redis: 6379) are open for connection

- Install dependencies
```bash
pnpm i
```

- Run development server (client & server)
```bash
pnpm dev
```

- Go to [http://localhost:3000](http://localhost:3000)

- (Optional) Seed database
```bash
pnpm --filter server seed
```

## Features Roadmap


### primary goals

- [x] sign up, login and logout
- [x] jwt user authentication/authorization
- [x] create room
- [x] join room
- [x] realtime messaging
- [x] typing indicators
- [x] socket.io cluster adapter integration
- [x] global error handling
- [x] redis implementation (typing users, online users)
- [x] online status
- [x] realtime member list update
- [x] infinite scroll pagination (messages/rooms/members)
- [ ] delete room
- [ ] e2e encryption
- [ ] read receipts
- [ ] alert component
- [ ] confirm dialog
- [ ] query cache - invalidation/refetch
- [ ] extract db operation to dao

### extras

- [ ] swagger ui
- [ ] playwright e2e tests for chat
- [ ] socket.io redis streams adapter integration
- [ ] switch to postgresql (support transaction)
- [ ] keploy api test generation
- [ ] private rooms - invite
- [ ] notifications

## Authors

- Aseer KT - [aseerkt.com](https://aseerkt.com)