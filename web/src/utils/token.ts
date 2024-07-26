import { fetcher } from './api'

class Token {
  #token?: string

  get() {
    return this.#token
  }

  set(token: string) {
    this.#token = token
  }

  remove() {
    this.#token = undefined
  }

  async recreate() {
    const { accessToken } = await fetcher('refresh')
    this.#token = accessToken
  }

  decode() {
    if (!this.#token) return

    const base64Url = this.#token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join(''),
    )
    return JSON.parse(jsonPayload)
  }
}

export const accessToken = new Token()
