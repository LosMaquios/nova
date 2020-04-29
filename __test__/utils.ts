import { 
  defineElement, 
  getElementInstance, 
  NovaElementInstance, 
  DefineOptions, 
  context
} from '../src'

let elementCount = 0

export const runInInstance = (
  runner: <T extends keyof HTMLElementTagNameMap>(
    instance: NovaElementInstance<T>, 
    done: jest.DoneCallback
  ) => void,
  attrs: DefineOptions['observedAttributes'] = []
): jest.ProvidesCallback => {
  return done => {
    function TestElement () {
      const instance = getElementInstance()
      const runnerContext = context(runner)

      setTimeout(() => {
        runnerContext(instance, done)
      })
    }

    const tag = `test-element-${++elementCount}`

    defineElement(TestElement, { tag, observedAttributes: attrs })
    document.createElement(tag)
  }
}
