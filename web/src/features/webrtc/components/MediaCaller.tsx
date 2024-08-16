import { Phone } from 'lucide-react'
import { useEffect, useRef } from 'react'

export const MediaCaller = ({ onCancel }: { onCancel: () => void }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    startStream()

    return () => {
      stopStream()
    }
  }, [])

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
    } catch (error) {
      // TODO: handle stream error
    }
  }

  const handleCancelStream = () => {
    stopStream()
    onCancel()
  }

  const stopStream = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      localVideoRef.current.srcObject = null
    }
  }

  return (
    <div>
      <div className='mb-5 flex justify-center'>
        <video ref={localVideoRef} autoPlay playsInline controls={false} />
      </div>
      <div className='mt-3 inline-flex w-full items-center justify-around'>
        {/* <button type='button' aria-label='toggle video visibility'>
          {isVideoShared ? <Video /> : <VideoOff />}
        </button>
        <button type='button' aria-label='toggle audio visibility'>
          {isMuted ? <Mic /> : <MicOff />}
        </button> */}
        <button
          type='button'
          aria-label='cancel call'
          onClick={handleCancelStream}
        >
          <Phone />
        </button>
      </div>
    </div>
  )
}
