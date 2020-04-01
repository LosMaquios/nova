import { defineElement, attr } from '../src'

describe('api: composers', () => {
  test('composer `attr`', done => {
    function TestComposerAttr () {
      const id = attr('id')

      expect(id.value).toBeNull()

      id.watch((newID, oldID) => {
        expect(oldID).toBeNull()
        expect(newID).toBe('some-id')
        done()
      })

      setTimeout(() => {
        id.value = 'some-id'
      })
    }

    defineElement(TestComposerAttr)

    document.createElement('test-composer-attr')
  })
  test.todo('composer `prop`')
  test.todo('composer `method`')
  test.todo('composer `on`')

  /**
   * CE callbacks
   */
  test.todo('composer `onConnected`')
  test.todo('composer `onDisconnected`')
  test.todo('composer `onAttributeChanged`')
})
