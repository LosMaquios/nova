import { defineElement, getElementInstance, NovaElementInstance } from '../src'

let elementCount = 0

export const runInInstance = (
  runner: <T extends keyof HTMLElementTagNameMap>(
    instance: NovaElementInstance<T>, 
    done: jest.DoneCallback
  ) => void
): jest.ProvidesCallback => {
  return done => {
    function TestElement () {
      const instance = getElementInstance()
      runner(instance, done)
    }

    const tag = `test-element-${++elementCount}`

    defineElement(TestElement, { tag })
    document.createElement(tag)
  }
}
