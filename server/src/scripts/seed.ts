import '../utils/loadModules'

import { connectDB, db } from '@/database'
import { NewGroup, groupsTable } from '@/modules/groups/groups.schema'
import { NewMember, membersTable } from '@/modules/members/members.schema'
import { NewMessage, messagesTable } from '@/modules/messages/messages.schema'
import { NewUser, usersTable } from '@/modules/users/users.schema'
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
    console.log('Dropping tables'.yellow.bold)

    await db.delete(messagesTable)
    await db.delete(membersTable)
    await db.delete(groupsTable)
    await db.delete(usersTable)

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
      await db.insert(usersTable).values(userValues)
    }

    const insertedUsers = await db
      .select({ id: usersTable.id })
      .from(usersTable)

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
      await db.insert(groupsTable).values(groupValues)
    }

    const insertedGroups = await db
      .select({ id: groupsTable.id, ownerId: groupsTable.ownerId })
      .from(groupsTable)

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
        await db
          .insert(membersTable)
          .values(memberValues.slice(k, k + BATCH_SIZE))
        await db
          .insert(messagesTable)
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
