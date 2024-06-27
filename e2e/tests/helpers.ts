import { faker } from '@faker-js/faker'

export const user = {
  username: faker.internet.userName(),
  password: faker.internet.password(),
}
