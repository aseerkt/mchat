import { ClientToServerEvents, ServerToClientEvents } from 'common/socket'
import { Socket } from 'socket.io-client'

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>
