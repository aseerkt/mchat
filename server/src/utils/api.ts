import { Response } from 'express'

export function notFound(res: Response, resource = 'Resource') {
  res.status(404).json({ message: `${resource} not found` })
}

export function notAuthenticated(res: Response) {
  res.status(401).json({ message: 'Not authenticated' })
}

export function notAuthorized(res: Response) {
  res.status(403).json({ message: 'Not authorized' })
}

export function badRequest(res: Response, message = 'Bad request') {
  res.status(400).json({ message })
}
