import { faker } from '@faker-js/faker'
import { hash } from 'argon2'
import 'colors'
import 'dotenv/config'
import { Message } from '../models/Message'
import { IRoom, Room } from '../models/Room'
import { IUser, User } from '../models/User'
import { connectDB } from '../utils/db'

const USER_COUNT = 10
const ROOM_COUNT = 5
const USER_PASSWORD = 'bob@123'

async function getHashedPassword() {
  return hash(USER_PASSWORD)
}

async function seedDatabase() {
  try {
    await connectDB()

    console.log('Dropping collections'.yellow.bold)

    await Message.deleteMany({})
    await Room.deleteMany({})
    await User.deleteMany({})

    console.log('Seed started'.blue.bold)

    const password = await getHashedPassword()

    const users: IUser[] = []

    users.push({
      username: 'bob',
      password,
    })

    for (let i = 0; i < USER_COUNT - 1; i++) {
      users.push({
        username: faker.internet.userName(),
        password,
      })
    }

    const insertedUsers = await User.create(users)

    const rooms: IRoom[] = []

    for (let i = 0; i < ROOM_COUNT; i++) {
      rooms.push({
        name: faker.hacker.noun(),
        createdBy: {
          _id: insertedUsers[i]._id,
          username: insertedUsers[i].username,
        },
      })
    }

    await Room.create(rooms)

    console.log('Seed completed'.green.bold)
  } catch (err) {
    console.log('Seed failed'.red.bold)
    console.error(err)
  }
}

seedDatabase().then(() => process.exit(0))
