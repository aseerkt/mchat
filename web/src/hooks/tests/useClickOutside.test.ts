import { renderHook } from '@testing-library/react'
import { Mock } from 'vitest'
import { useClickOutside } from '../useClickOutside'

describe('useClickOutside', () => {
  let ref: React.RefObject<HTMLDivElement>
  let callback: Mock

  beforeEach(() => {
    callback = vi.fn()
    ref = {
      current: document.createElement('div'),
    } as React.RefObject<HTMLDivElement>
  })

  it('should call callback when clicking outside the element', () => {
    document.body.appendChild(ref.current!)

    renderHook(() => useClickOutside(ref, callback))

    // Simulate clicking outside the element
    document.body.click()

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should not call callback when clicking inside the element', () => {
    document.body.appendChild(ref.current!)

    renderHook(() => useClickOutside(ref, callback))

    // Simulate clicking inside the element
    ref.current!.click()

    expect(callback).not.toHaveBeenCalled()
  })

  it('should clean up event listeners on unmount', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener')
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

    const { unmount } = renderHook(() => useClickOutside(ref, callback))

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'mousedown',
      expect.any(Function),
    )

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mousedown',
      expect.any(Function),
    )

    // Clean up
    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
  })
})
