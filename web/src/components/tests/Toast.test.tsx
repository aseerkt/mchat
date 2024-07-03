import { timeout } from '@/utils/testUtils'
import { render } from '@testing-library/react'
import { Toast } from '../Toast'

describe('<Toast / > tests', () => {
  it('should show toast only for 3 sec', async () => {
    const onOnOpenSpy = vi.fn()
    const { baseElement } = render(
      <Toast open={true} onOpenChange={onOnOpenSpy}>
        This is a toast!
      </Toast>,
    )
    expect(baseElement).toMatchSnapshot('toast visible')
    await timeout(3500)
    expect(onOnOpenSpy).toBeCalledWith(false)
  })
})
