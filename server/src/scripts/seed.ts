import { faker } from '@faker-js/faker'
import { hash } from 'argon2'
import 'colors'
import 'dotenv/config'
import { Types } from 'mongoose'
import { IMember, Member } from '../models/Member'
import { IMessage, Message } from '../models/Message'
import { IRoom, Room } from '../models/Room'
import { IUser, User } from '../models/User'
import { connectDB } from '../utils/db'

const USER_COUNT = 1000
const ROOM_COUNT_PER_USER = 5
const MEMBER_COUNT_PER_ROOM = 35
const MESSAGE_PER_MEMBER = 5
const USER_PASSWORD = 'bob@123'
const BATCH_SIZE = 100 // Adjust batch size as needed

async function getHashedPassword() {
  return hash(USER_PASSWORD)
}

async function seedDatabase() {
  try {
    await connectDB()

    console.time('seed')
    console.log('Dropping collections'.yellow.bold)

    await Message.deleteMany({})
    await Member.deleteMany({})
    await Room.deleteMany({})
    await User.deleteMany({})

    console.log('Seed started'.blue.bold)

    const password = await hash(USER_PASSWORD)

    // Batch insert users
    for (let i = 0; i < USER_COUNT; i += BATCH_SIZE) {
      const users: IUser[] = []
      for (let j = 0; j < BATCH_SIZE && i + j < USER_COUNT; j++) {
        users.push({
          username: faker.internet.userName().toLowerCase(),
          password,
        })
      }
      await User.insertMany(users)
    }

    const insertedUsers = await User.find({})

    // Batch insert rooms
    for (let i = 0; i < USER_COUNT * ROOM_COUNT_PER_USER; i += BATCH_SIZE) {
      const rooms: IRoom[] = []
      for (
        let j = 0;
        j < BATCH_SIZE && i + j < USER_COUNT * ROOM_COUNT_PER_USER;
        j++
      ) {
        const userIndex = Math.floor((i + j) / ROOM_COUNT_PER_USER)
        rooms.push({
          name: faker.hacker.noun(),
          createdBy: {
            _id: insertedUsers[userIndex]
              ._id as unknown as typeof Types.ObjectId,
            username: insertedUsers[userIndex].username,
          },
        })
      }
      await Room.insertMany(rooms)
    }

    const insertedRooms = await Room.find({})

    // Batch insert members and messages
    for (let i = 0; i < insertedRooms.length; i++) {
      const room = insertedRooms[i]
      const roomMemberSet: Record<string, boolean> = {}
      const members: IMember[] = []
      const messages: IMessage[] = []

      function getUserWhoIsNotOwner() {
        const randomUser = faker.helpers.arrayElement(insertedUsers)
        const roomMemberSetKey = `${room._id.toString()}:${randomUser._id.toString()}`
        if (
          roomMemberSet[roomMemberSetKey] ||
          randomUser._id.toString() === room.createdBy._id.toString()
        ) {
          return getUserWhoIsNotOwner()
        }
        roomMemberSet[roomMemberSetKey] = true
        return randomUser
      }

      for (let j = 0; j < MEMBER_COUNT_PER_ROOM; j++) {
        const user = getUserWhoIsNotOwner()

        members.push({
          role: 'member',
          roomId: room._id as unknown as typeof Types.ObjectId,
          user: {
            _id: user._id as unknown as typeof Types.ObjectId,
            username: user.username,
          },
        })

        for (let k = 0; k < MESSAGE_PER_MEMBER; k++) {
          messages.push({
            roomId: room._id as unknown as typeof Types.ObjectId,
            sender: {
              _id: user._id as unknown as typeof Types.ObjectId,
              username: user.username,
            },
            text: faker.word.words(5),
          })
        }
      }

      // Insert members and messages in batches
      for (let k = 0; k < members.length; k += BATCH_SIZE) {
        await Member.insertMany(members.slice(k, k + BATCH_SIZE))
        await Message.insertMany(
          messages.slice(
            k * MESSAGE_PER_MEMBER,
            (k + BATCH_SIZE) * MESSAGE_PER_MEMBER,
          ),
        )
      }
    }

    console.log('Seed completed'.green.bold)
    console.timeEnd('seed')
    process.exit(0)
  } catch (err) {
    console.log('Seed failed'.red.bold)
    console.error(err)
    process.exit(1)
  }
}

seedDatabase()
