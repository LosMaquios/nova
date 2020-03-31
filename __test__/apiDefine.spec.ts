import { defineElement } from '../src/index'

describe('api: defineElement', () => {
  test('simple definition', () => {
    function TestElement () {
      // Empty body
    }

    defineElement(TestElement)

    const $testElement = document.createElement('test-element')

    expect(($testElement as any).__constructor).toBe(TestElement)
  })

  test('definition with `type` option', () => {
    function TestButton () {
      // Empty body
    }

    defineElement(TestButton, { type: 'button' })

    const $testButton = document.createElement('button', { is: 'test-button' })

    expect(($testButton as any).__constructor).toBe(TestButton)
    expect($testButton).toBeInstanceOf(HTMLButtonElement)
  })

  test('definition with `tag` option', () => {
    function Test () {
      // Empty body
    }

    defineElement(Test, { tag: 'test-element2' })

    const $testElement = document.createElement('test-element2')

    expect(($testElement as any).__constructor).toBe(Test)
  })

  test('full definition', () => {
    function SomeInput () {
      // Empty body
    }

    defineElement(SomeInput, { 
      tag: 'test-input',
      type: 'input'
    })

    const $testInput = document.createElement('input', { is: 'test-input' })

    expect(($testInput as any).__constructor).toBe(SomeInput)
    expect($testInput).toBeInstanceOf(HTMLInputElement)
  })
})
