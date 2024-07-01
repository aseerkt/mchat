import { faker } from '@faker-js/faker'
import { Page } from '@playwright/test'

export const user = {
  username: faker.internet.userName(),
  password: faker.internet.password(),
}

export const authFile = 'playwright/.auth/user.json'
export const authTokenLsKey = 'jwt'

export const decodeToken = (token: string) => {
  if (!token) return

  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      })
      .join(''),
  )

  return JSON.parse(jsonPayload)
}

export const getAuthFromPageContext = async (page: Page) => {
  const storageState = await page.context().storageState({ path: authFile })

  const lsAuthEntry = storageState.origins[0].localStorage.find(
    entry => entry.name === authTokenLsKey,
  )

  return decodeToken(lsAuthEntry.value)
}
