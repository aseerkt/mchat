import { faker } from '@faker-js/faker'
import { Browser, expect, Page } from '@playwright/test'

export const signup = async (page: Page) => {
  const user = {
    fullName: faker.person.fullName(),
    username: faker.internet.userName(),
    password: faker.internet.password(),
  }
  await page.goto('/auth/signup')
  await page.getByLabel('Full name').fill(user.fullName)
  await page.getByLabel('Username').fill(user.username)
  await page.getByLabel('Password').fill(user.password)
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page.getByText(`Sign up success`)).toBeVisible()

  await page.waitForURL('/chat')

  await expect(
    page.locator('header').filter({ hasText: user.username }),
  ).toBeVisible()

  return { user }
}

export const createNewUserSession = async (browser: Browser) => {
  const context = await browser.newContext()
  const page = await context.newPage()

  const { user } = await signup(page)

  return { page, user }
}
