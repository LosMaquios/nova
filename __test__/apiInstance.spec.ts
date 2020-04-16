import { getElementInstance, context } from '../src'
import { runInInstance } from './utils'

describe('api: instance', () => {
  test('get instance', runInInstance((instance, done) => {
    // We're calling `getElementInstance` internally
    // in `runInInstance` definition

    expect(typeof instance.__id).toBe('string')
    expect(typeof instance.__constructor).toBe('function')

    done()
  }))

  test('wrong get instance call', done => {
    const UNKNOWN_INSTANCE_ERROR_MSG = 'Unknown instance'

    const expectInstanceError = () => {
      expect(() => getElementInstance()).toThrowError(UNKNOWN_INSTANCE_ERROR_MSG)
    }

    // At root level
    expectInstanceError()

    runInInstance((_, done) => {
      expect(() => getElementInstance()).not.toThrowError(UNKNOWN_INSTANCE_ERROR_MSG)

      setTimeout(() => {
        // `delayed`
        expectInstanceError()
        done()
      })
    })(done)
  })

  test('should preserve instance', runInInstance((instance, done) => {
    const runExpectations = context(() => {
      expect(getElementInstance()).toBe(instance)
      done()
    })

    setTimeout(runExpectations, 100)
  }))
})
