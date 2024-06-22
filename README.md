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

- Spin up MongoDB and Redis
```bash
docker compose up -d
```

> Make sure these ports are not occupied
> MongoDB => 27017 | Redis => 6379

- Install dependencies
```bash
pnpm i
```

- Run client and server
```bash
pnpm dev
```
- Go to [http://localhost:3000](http://localhost:3000)

## Features Roadmap

- [x] sign up, login and logout users
- [x] user authentication
- [x] create room
- [x] realtime messaging
- [x] typing indicators
- [ ] redis implementation (typing users, online users)
- [ ] socket.io redis adapter integration
- [ ] socket.io cluster adapter integration
- [ ] input sanitization 
- [ ] global error handling
- [ ] online members
- [ ] e2e encryption
- [ ] read receipts
- [ ] delete room


## Authors

- Aseer KT - [aseerkt.com](https://aseerkt.com)