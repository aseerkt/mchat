interface UserPayload {
  id: number
  username: string
  fullName: string
}

declare namespace Express {
  export interface Request {
    user?: UserPayload
  }
}
