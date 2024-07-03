import { render } from '@testing-library/react'
import { Dialog } from '../Dialog'

describe('<Dialog /> tests', () => {
  it('should match snapshot for isOpen false', () => {
    const { baseElement } = render(
      <Dialog isOpen={false} onClose={() => {}}>
        hello world
      </Dialog>,
    )
    expect(baseElement).toMatchSnapshot()
  })

  it('should match snapshot for isOpen true', () => {
    const { baseElement } = render(
      <Dialog isOpen={true} onClose={() => {}}>
        hello world
      </Dialog>,
    )
    expect(baseElement).toMatchSnapshot()
  })
})
