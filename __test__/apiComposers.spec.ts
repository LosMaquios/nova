import { 
  attr, 
  prop, 
  method, 
  on, 
  onConnected, 
  onDisconnected, 
  onAttributeChanged,
  defineElement,
  getElementInstance,
  onAdopted
} from '../src'
import { runInInstance } from './utils'

describe('api: composers', () => {
  test('composer `attr`', runInInstance((instance, done) => {
    const id = attr('id')
    const NEW_ID = 'some-id'

    expect(id.value).toBeNull()

    id.watch((newID, oldID) => {
      expect(oldID).toBeNull()
      expect(newID).toBe(NEW_ID)
      expect(instance.getAttribute('id')).toBe(NEW_ID)
      done()
    })

    setTimeout(() => {
      id.value = NEW_ID
    })
  }))

  test('composer `prop`', runInInstance((instance, done) => {
    const active = prop('active', false)
    const NEW_ACTIVE = true

    expect(active.value).toBe(false)
    expect((instance as any).active).toBe(false)

    active.watch((newActive, oldActive) => {
      expect(oldActive).toBe(false)
      expect(newActive).toBe(NEW_ACTIVE)
      expect((instance as any).active).toBe(NEW_ACTIVE)
      done()
    })

    active.value = true
  }))

  test('composer `method`', runInInstance((instance, done) => {
    const toggleSpy = jest.fn()
    const toggle = method('toggle', toggleSpy)

    toggle()
    ;(instance as any).toggle()

    expect(toggleSpy).toBeCalledTimes(2)
    done()
  }))

  test('composer `on`', runInInstance((instance, done) => {
    const listenerSpy = jest.fn()
    const event = new CustomEvent('test', { detail: { a: 'b' } })

    on('test' as any, listenerSpy)
    instance.dispatchEvent(event)

    expect(listenerSpy).toBeCalledWith(event)
    done()
  }))

  /**
   * CE callbacks
   */
  test('composer `onConnected`', runInInstance((instance, done) => {
    onConnected(done)

    setTimeout(() => {
      document.body.append(instance)
    })
  }))

  test('composer `onDisconnected`', runInInstance((instance, done) => {
    onDisconnected(done)

    setTimeout(() => {
      const { body } = document

      body.append(instance)

      setTimeout(() => {
        body.removeChild(instance)
      })
    })
  }))

  test('composer `onAttributeChanged`', done => {
    function TestAttributeChanged () {
      const instance = getElementInstance()

      onAttributeChanged((name, oldValue, newValue) => {
        expect(name).toBe('id')
        expect(oldValue).toBeNull()
        expect(newValue).toBe('some-id')

        done()
      })

      setTimeout(() => {
        instance.setAttribute('id', 'some-id')
      })
    }

    defineElement(TestAttributeChanged, { observedAttributes: ['id'] })
    document.createElement('test-attribute-changed')
  })

  test('composer `onAdopted`', runInInstance((instance, done) => {
    const currentDocument = instance.ownerDocument
    const nextDocument = document.implementation.createHTMLDocument()

    onAdopted((oldDocument, newDocument) => {
      expect(oldDocument).toBe(currentDocument)
      expect(newDocument).toBe(nextDocument)
      expect(instance.ownerDocument).toBe(nextDocument)

      done()
    })

    setTimeout(() => {
      nextDocument.adoptNode(instance)
    })
  }))
})
