import { render } from '@testing-library/react'
import { Button } from '../Button'

describe('<Button /> tests', () => {
  it('should match snapshot', () => {
    const { baseElement } = render(<Button>button</Button>)
    expect(baseElement).toMatchSnapshot()
  })
})
