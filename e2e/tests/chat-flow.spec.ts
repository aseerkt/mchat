import { faker } from '@faker-js/faker'
import { Locator, Page, expect, test } from '@playwright/test'
import { getAuthFromPageContext } from './helpers'

const groupCount = 2
const messageCount = 5

async function createGroup(page: Page) {
  const groupName = faker.company.name()
  await page.getByRole('button', { name: 'New group' }).click()
  await page.getByLabel('Group name').fill(groupName)
  await page.getByRole('button', { name: 'Create', exact: true }).click()

  const successToast = page.getByText(`Group "${groupName}" created`)

  await expect(successToast).toBeInViewport()
  await expect(successToast).not.toBeInViewport()

  await page.waitForTimeout(2000)

  await expect(page.getByRole('link', { name: groupName })).toBeVisible()
  await expect(
    page.locator('header').filter({ hasText: groupName }),
  ).toBeVisible()
}

test.describe('chat flow', () => {
  test('create group', async ({ page }) => {
    await page.goto('http://localhost:3000/chat')

    for (let i = 0; i < groupCount; i++) {
      await createGroup(page)
    }
  })

  test('send message', async ({ page }) => {
    await page.goto('http://localhost:3000/chat')

    await createGroup(page)

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

  test('join group', async ({ page }) => {
    await page.goto('http://localhost:3000/chat')

    await page.getByRole('button', { name: 'Join group' }).click()
    const groupLabels = await page.locator('label').all()

    async function joinGroup(label: Locator) {
      await label.click()
      return label.innerText()
    }

    const groupNames = await Promise.all(
      groupLabels.slice(0, groupCount).map(joinGroup),
    )

    await page.getByRole('button', { name: 'Join', exact: true }).click()

    for (const name of groupNames) {
      await expect(page.getByRole('link', { name })).toBeVisible()
    }
  })

  test('member list drawer', async ({ page }) => {
    await page.goto('http://localhost:3000/chat')

    const auth = await getAuthFromPageContext(page)

    await createGroup(page)
    // MEMBER LIST
    await page.getByRole('button', { name: 'open member drawer' }).click()
    // add assertion here
    await expect(
      page.getByRole('listitem').getByText(auth.username),
    ).toBeVisible()
  })
})
