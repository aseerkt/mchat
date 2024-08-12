import { test as setup } from '@playwright/test'
import { signup } from './events'
import { authFile } from './helpers'

setup('authenticate', async ({ page }) => {
  await signup(page)

  await page.context().storageState({ path: authFile })
})
