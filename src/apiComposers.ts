import { 
  NovaElementCallbacks, 
  getElementInstance,
  NovaElementInstance
} from './apiInstance'
import { WatcherHandler, Watcher } from './WatcherHandler'

export type NovaElementMethodDefinition = (...args: unknown[]) => unknown
export type NovaElementMethodDefinitionBound = (this: NovaElementInstance<any>, ...args: unknown[]) => unknown

export const onConnected = getCallbackComposer('connected')
export const onDisconnected = getCallbackComposer('disconnected')
export const onAttributeChanged = getCallbackComposer('attributeChanged')
export const onAdopted = getCallbackComposer('adopted')

export function attr (name: string, allowWatch = true) {
  const instance = getElementInstance()

  const result = {
    get value () {
      return instance.getAttribute(name)
    },
    set value (newValue: string) {
      instance.setAttribute(name, newValue)
    },
    watch: null
  }

  if (allowWatch) {
    const watcherHandler = instance.__registerWatchedAttr(name)
    result.watch = watcherHandler.addWatcher.bind(watcherHandler)
  }

  return result
}

export function prop (name: PropertyKey, defaultValue?: any) {
  const instance = getElementInstance()
  const watcherHandler = instance.__registerWatchedProp(name, defaultValue)

  return {
    get value () {
      return instance[name]
    },
    set value (newValue: unknown) {
      instance[name] = newValue
    },
    watch: watcherHandler.addWatcher.bind(watcherHandler)
  }
}

export function method (fn: NovaElementMethodDefinition): NovaElementMethodDefinitionBound
export function method (methodName: string, fn?: NovaElementMethodDefinition): NovaElementMethodDefinitionBound
export function method (
  methodNameOrFn: string | NovaElementMethodDefinition, 
  fn?: NovaElementMethodDefinition
): NovaElementMethodDefinitionBound {
  const instance = getElementInstance()

  let methodName: string

  if (typeof methodNameOrFn === 'string') {
    methodName = methodNameOrFn
  }

  if (!fn) {
    if (!(methodName in instance)) {
      throw new Error(`Unknown method: ${methodName}`)
    }

    return instance[methodName].bind(instance)
  }

  instance[methodName] = fn

  return fn.bind(instance)
}

export function on <K extends keyof HTMLElementEventMap>(
  type: K, 
  listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, 
  options?: boolean | AddEventListenerOptions
): () => void
export function on (
  type: string, 
  listener: EventListenerOrEventListenerObject, 
  options?: boolean | AddEventListenerOptions
): () => void {
  const instance = getElementInstance()

  instance.addEventListener(type, listener, options)

  return () => {
    instance.removeEventListener(type, listener, options)
  }
}

function getCallbackComposer<T extends keyof NovaElementCallbacks> (callbackName: T) {
  return (fn: NovaElementCallbacks[T][number]) => {
    const instance = getElementInstance()

    return instance.__attachCallback(callbackName, fn)
  }
}
