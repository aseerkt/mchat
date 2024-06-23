import { useEffect, useState } from 'react'
import { config } from '../config'
import { getSocketIO } from '../utils/socket'
import { removeToken } from '../utils/token'

export const useSocketConnect = () => {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socket = getSocketIO()

    function onConnect() {
      console.info('socket connected')
      setIsConnected(true)
    }

    function onDisconnect() {
      console.info('socket disconnected')
      setIsConnected(false)
    }
    if (socket.disconnected) {
      socket.connect()
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    socket.on('connect_error', err => {
      console.log('socket err: ', err)
      removeToken()
      window.location.href = '/'
    })

    if (config.isDev) {
      socket.onAny((event, ...args) => {
        console.log('incoming event: ', event)
        console.log('event args: ', args)
      })
    }

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)

      if (socket.connected) {
        socket.disconnect()
      }
    }
  }, [])

  return {
    isConnected,
  }
}
