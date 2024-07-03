import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useAutoFocus } from '../useAutoFocus'

describe('useAutoFocus', () => {
  it('should focus the element on mount', () => {
    const focusMock = vi.fn()

    const ref = {
      current: { focus: focusMock },
    } as unknown as React.RefObject<HTMLInputElement>

    renderHook(() => useAutoFocus(ref))

    expect(focusMock).toHaveBeenCalledTimes(1)
  })

  it('should focus the element on dependency change', () => {
    const focusMock = vi.fn()

    const ref = {
      current: { focus: focusMock },
    } as unknown as React.RefObject<HTMLInputElement>

    const { rerender } = renderHook(({ deps }) => useAutoFocus(ref, deps), {
      initialProps: { deps: [1] },
    })

    expect(focusMock).toHaveBeenCalledTimes(1)

    rerender({ deps: [2] })

    expect(focusMock).toHaveBeenCalledTimes(2)
  })
})
