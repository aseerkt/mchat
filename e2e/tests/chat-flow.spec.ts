import { faker } from '@faker-js/faker'
import { Locator, Page, expect, test } from '@playwright/test'
import { user } from './helpers'

const roomCount = 2
const messageCount = 5

async function createRoom(page: Page) {
  const roomName = faker.company.name()
  await page.getByRole('button', { name: 'Create Room' }).click()
  await page.getByLabel('Room name').fill(roomName)
  await page.getByRole('button', { name: 'Create', exact: true }).click()

  const successToast = page.getByText(`Room "${roomName}" created`)

  await expect(successToast).toBeInViewport()
  await expect(successToast).not.toBeInViewport()

  await page.waitForTimeout(2000)

  await expect(page.getByRole('link', { name: roomName })).toBeVisible()
  await expect(
    page.locator('header').filter({ hasText: roomName }),
  ).toBeVisible()
}

test.describe('chat flow', () => {
  test('create room', async ({ page }) => {
    await page.goto('http://localhost:3000/chat')

    for (let i = 0; i < roomCount; i++) {
      await createRoom(page)
    }
  })

  test('send message', async ({ page }) => {
    await page.goto('http://localhost:3000/chat')

    await createRoom(page)

    async function sendMessage() {
      const message = faker.word.words(3)
      await page.getByPlaceholder('Send message...').fill(message)
      await page.getByPlaceholder('Send message...').press('Enter')

      await page.waitForTimeout(2000)

      await expect(page.getByText(`${message}Today`)).toBeVisible()
    }

    for (let i = 0; i < messageCount; i++) {
      await sendMessage()
    }
  })

  test('member list drawer', async ({ page }) => {
    await page.goto('http://localhost:3000/chat')

    await createRoom(page)
    // MEMBER LIST
    await page.getByRole('button', { name: 'open member drawer' }).click()
    // add assertion here
    await expect(
      page.getByRole('listitem').getByText(user.username),
    ).toBeVisible()
  })

  test('join room', async ({ page }) => {
    await page.goto('http://localhost:3000/chat')

    await page.getByRole('button', { name: 'Join Room' }).click()
    const roomLabels = await page.locator('label').all()

    async function joinRoom(label: Locator) {
      await label.click()
      return label.innerText()
    }

    const roomNames = await Promise.all(
      roomLabels.slice(0, roomCount).map(joinRoom),
    )

    await page.getByRole('button', { name: 'Join room', exact: true }).click()

    for (const name of roomNames) {
      await expect(page.getByRole('link', { name: name })).toBeVisible()
    }
  })
})
