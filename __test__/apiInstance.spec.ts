import {
  getElementInstance, 
  defineElement 
} from '../src'

describe('api: instance', () => {
  test('get instance', async () => {
    function TestElementInstance () {
      const instance = getElementInstance()

      expect(typeof instance.__id).toBe('string')
      expect(instance.__constructor).toBe(TestElementInstance)
    }

    defineElement(TestElementInstance)

    document.createElement('test-element-instance')
    await customElements.whenDefined('test-element-instance')

    // wrong instance call
    expect(() => getElementInstance()).toThrowError('Unknown instance')
  })
})
