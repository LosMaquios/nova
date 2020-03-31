import { defineElement } from '../src/index'

describe('api: defineElement', () => {
  test('simple definition', async () => {
    function TestElement () {
      // Empty body
    }

    defineElement(TestElement)

    const $testElement = document.createElement('test-element')

    expect(($testElement as any).__constructor === TestElement).toBeTruthy()
  })
})
