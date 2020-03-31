# Nova.js

  Microframework for composable custom-elements

## Example

```ts
import { 
  // Utils
  getElementInstance,

  // Composers
  attr, 
  prop,
  method,
  on,
  onConnected,
  onDisconnected,

  // Register functional custom element
  defineElement
} from 'nova'

function NovaButton () {
  const id = attr('id')
  const type = prop('type')

  const $element = getElementInstance()

  console.assert($element.tagName === 'button')

  const unwatchID = id.watch((oldID, newID) => {
    // ...
    console.assert(id.value === newID)
    unwatchID()
  })

  const unwatchType = type.watch((oldType, newType) => {
    // ...
    console.assert(type.value === newType)
    unwatchType()
  })

  const offOnConnected = onConnected(() => {
    console.log('Connected callback')
  })

  const offOnDisconnected = onDisconnected(() => {
    console.log('Disconnected callback')
  })

  function doSomething () {
    console.log('Doing something')
  }

  const doSomething = method('doSomething', doSomething)

  method(doSomething)

  const doSomething2 = method('doSomething') // Get method

  const offClick = on('click', () => {
    doSomething()
    offClick()
  })
}

defineElement(NovaButton, { 
  tag: 'nova-button',
  type: 'button' 
})
```

```ts
const $novaButton = document.createElement('nova-button')

$novaButton.setAttribute('id', 'some-id')
$novaButton.type = 'primary'

$novaButton.doSomething()
$novaButton.click()
```