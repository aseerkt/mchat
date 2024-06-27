import { expect, test as setup } from '@playwright/test'
import { user } from './helpers'

const authFile = 'playwright/.auth/user.json'

setup('authenticate', async ({ page }) => {
  async function checkForChatPage() {
    await page.waitForURL('http://localhost:3000/chat')

    await expect(
      page.locator('header').filter({ hasText: user.username }),
    ).toBeVisible()
  }

  // Sign up user
  await page.goto('http://localhost:3000/signup')
  await page.getByLabel('Username').fill(user.username)
  await page.getByLabel('Password').fill(user.password)
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page.getByText(`Sign up success`)).toBeVisible()
  await checkForChatPage()

  // Logout user
  await page.getByLabel('logout').click()
  await page.waitForURL('http://localhost:3000/login')

  // Login
  await page.getByLabel('Username').fill(user.username)
  await page.getByLabel('Password').fill(user.password)
  await page.getByRole('button', { name: 'Continue' }).click()

  await expect(page.getByText(`Login success`)).toBeVisible()
  await checkForChatPage()

  await page.context().storageState({ path: authFile })
})
