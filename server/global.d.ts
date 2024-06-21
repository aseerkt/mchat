interface UserPayload {
  _id: string
  username: string
}

declare namespace Express {
  export interface Request {
    user?: UserPayload
  }
}


