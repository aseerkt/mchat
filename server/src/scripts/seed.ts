import { connectDB, db } from '@/database'
import { NewGroup, groups } from '@/modules/groups/groups.schema'
import { NewMember, members } from '@/modules/members/members.schema'
import { NewMessage, messages } from '@/modules/messages/messages.schema'
import { NewUser, users } from '@/modules/users/users.schema'
import { faker } from '@faker-js/faker'
import { hash } from 'argon2'
import 'colors'

const USER_PASSWORD = 'bob@123'
const USER_COUNT = 50

const GROUP_COUNT_PER_USER = 5
const MEMBER_COUNT_PER_GROUP = 5
const MESSAGE_PER_MEMBER = 5
const BATCH_SIZE = 100

async function seedDatabase() {
  try {
    await connectDB()

    console.time('seed')
    console.log('Dropping collections'.yellow.bold)

    await db.delete(messages)
    await db.delete(members)
    await db.delete(groups)
    await db.delete(users)

    console.log('Seed started'.blue.bold)

    const password = await hash(USER_PASSWORD)

    // Batch insert users
    for (let i = 0; i < USER_COUNT; i += BATCH_SIZE) {
      const userValues: NewUser[] = []
      for (let j = 0; j < BATCH_SIZE && i + j < USER_COUNT; j++) {
        userValues.push({
          username: faker.internet.userName().toLowerCase(),
          password,
          fullName: faker.person.fullName(),
        })
      }
      await db.insert(users).values(userValues)
    }

    const insertedUsers = await db.select({ id: users.id }).from(users)

    // Batch insert groups
    for (let i = 0; i < USER_COUNT * GROUP_COUNT_PER_USER; i += BATCH_SIZE) {
      const groupValues: NewGroup[] = []
      for (
        let j = 0;
        j < BATCH_SIZE && i + j < USER_COUNT * GROUP_COUNT_PER_USER;
        j++
      ) {
        const userIndex = Math.floor((i + j) / GROUP_COUNT_PER_USER)
        groupValues.push({
          name: faker.hacker.noun(),
          ownerId: insertedUsers[userIndex].id,
        })
      }
      await db.insert(groups).values(groupValues)
    }

    const insertedGroups = await db
      .select({ id: groups.id, ownerId: groups.ownerId })
      .from(groups)

    // Batch insert members and messages
    for (let i = 0; i < insertedGroups.length; i++) {
      const group = insertedGroups[i]
      const groupMemberSet: Record<string, boolean> = {}
      const memberValues: NewMember[] = []
      const messageValues: NewMessage[] = []

      function getUserWhoIsNotMember() {
        const randomUser = faker.helpers.arrayElement(insertedUsers)
        const groupMemberSetKey = `${group.id}:${randomUser.id}`
        if (
          groupMemberSet[groupMemberSetKey] ||
          randomUser.id === group.ownerId
        ) {
          return getUserWhoIsNotMember()
        }
        groupMemberSet[groupMemberSetKey] = true
        return randomUser
      }

      for (let j = 0; j < MEMBER_COUNT_PER_GROUP; j++) {
        const user = getUserWhoIsNotMember()

        memberValues.push({
          role: 'member',
          groupId: group.id,
          userId: user.id,
        })

        for (let k = 0; k < MESSAGE_PER_MEMBER; k++) {
          messageValues.push({
            groupId: group.id,
            senderId: user.id,
            content: faker.word.words(5),
          })
        }
      }

      // Insert members and messages in batches
      for (let k = 0; k < memberValues.length; k += BATCH_SIZE) {
        await db.insert(members).values(memberValues.slice(k, k + BATCH_SIZE))
        await db
          .insert(messages)
          .values(
            messageValues.slice(
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
