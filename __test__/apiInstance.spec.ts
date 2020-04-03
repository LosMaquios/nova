import {
  getElementInstance, 
  defineElement 
} from '../src'

describe('api: instance', () => {
  test('get instance', done => {
    function TestElementInstance () {
      const instance = getElementInstance()

      expect(typeof instance.__id).toBe('string')
      expect(instance.__constructor).toBe(TestElementInstance)

      done()
    }

    defineElement(TestElementInstance)
    document.createElement('test-element-instance')
  })

  test('wrong get instance call', () => {
    // wrong instance call
    expect(() => getElementInstance()).toThrowError('Unknown instance')
  })
})
