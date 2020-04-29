import { 
  attr, 
  prop, 
  method, 
  on, 
  onConnected, 
  onDisconnected, 
  onAttributeChanged,
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

    id.value = NEW_ID
  }))

  test('composer `prop`', runInInstance((instance, done) => {
    const tagName = prop('tagName', 'non-tag')
    const active = prop('active', false)
    const NEW_ACTIVE = true

    expect(tagName.value).not.toBe('non-tag')
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
    const doSomethingSpy = jest.fn()
    const doSomething = () => doSomethingSpy()
    const toggle = method('toggle', toggleSpy)
    const setAttribute = method('setAttribute')
    method(doSomething)

    toggle()

    expect(() => method('unknownMethod')).toThrowError('Unknown method: unknownMethod')

    setAttribute('id', 'test')

    ;(instance as any).toggle()
    ;(instance as any).doSomething()

    expect(instance.getAttribute('id')).toBe('test')
    expect(toggleSpy).toBeCalledTimes(2)
    done()
  }))

  test('composer `on`', runInInstance((instance, done) => {
    const listenerSpy = jest.fn()
    const event = new CustomEvent('test', { detail: { a: 'b' } })

    const off = on('test' as any, e => {
      listenerSpy(e)
      off()
    })

    instance.dispatchEvent(event)
    instance.dispatchEvent(event)

    expect(listenerSpy).toBeCalledTimes(1)
    expect(listenerSpy).toBeCalledWith(event)
    done()
  }))

  /**
   * CE callbacks
   */
  test('composer `onConnected`', runInInstance((instance, done) => {
    onConnected(done)

    // Dispatch connected
    document.body.append(instance)
  }))

  test('composer `onDisconnected`', runInInstance((instance, done) => {
    onDisconnected(done)

    const { body } = document

    body.append(instance)

    setTimeout(() => {
      body.removeChild(instance)
    })
  }))

  test('composer `onAttributeChanged`', runInInstance((instance, done) => {
    let unwatchChanged
      
    const attributeChangedSpy = jest.fn(() => unwatchChanged())
    unwatchChanged = onAttributeChanged(attributeChangedSpy)

    instance.setAttribute('id', 'some-id')

    expect(attributeChangedSpy).toBeCalledWith(
      'id', // name
      null, // oldValue
      'some-id', // newValue
      null // domain
    )

    instance.setAttribute('id', 'not-tracked-id')
    expect(attributeChangedSpy).toBeCalledTimes(1)
    done()
  }, ['id']))

  test('composer `onAdopted`', runInInstance((instance, done) => {
    const currentDocument = instance.ownerDocument
    const nextDocument = document.implementation.createHTMLDocument()

    onAdopted((oldDocument, newDocument) => {
      expect(oldDocument).toBe(currentDocument)
      expect(newDocument).toBe(nextDocument)
      expect(instance.ownerDocument).toBe(nextDocument)

      done()
    })

    nextDocument.adoptNode(instance)
  }))
})
