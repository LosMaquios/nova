import { 
  NovaElementCallbacks, 
  getElementInstance,
  NovaElementInstance,
  context
} from './apiInstance'
import { WatcherHandler } from './WatcherHandler'

export type NovaElementMethodDefinition = (...args: unknown[]) => any

export const onConnected = getCallbackComposer('connected')
export const onDisconnected = getCallbackComposer('disconnected')
export const onAttributeChanged = getCallbackComposer('attributeChanged')
export const onAdopted = getCallbackComposer('adopted')

export interface WatchableValue<T> {
  value: T
  watch: WatcherHandler['addWatcher']
}

export type RemoveEventListenerFn = () => void

export function attr (name: string): WatchableValue<string> {
  const instance = getElementInstance()
  const watcherHandler = instance.__registerWatchedAttr(name)

 return createWatchableValue<string>(watcherHandler, {
    get () {
      return instance.getAttribute(name) as any
    },
    set (newValue) {
      instance.setAttribute(name, newValue)
    }
  })
}

export function prop<K extends keyof NovaElementInstance, T extends NovaElementInstance[K]> (name: K, defaultValue?: T): WatchableValue<T>
export function prop<T> (name: PropertyKey, defaultValue?: T): WatchableValue<T>
export function prop<T> (name: PropertyKey, defaultValue?: T): WatchableValue<T> {
  const instance = getElementInstance()
  const watcherHandler = instance.__registerWatchedProp(name, defaultValue)

  return createWatchableValue<T>(watcherHandler, {
    get () {
      return instance[name]
    },
    set (newValue) {
      instance[name] = newValue
    }
  })
}

export function method<T extends NovaElementMethodDefinition> (fn: T): T
export function method<K extends keyof NovaElementInstance> (methodName: K | string): NovaElementInstance[K] | NovaElementMethodDefinition
export function method<T extends NovaElementMethodDefinition> (methodName: string, fn: T): T
export function method<T extends NovaElementMethodDefinition> (methodNameOrFn: string | T, fn?: T): T {
  const instance = getElementInstance()

  let methodName: string

  if (typeof methodNameOrFn === 'string') {
    methodName = methodNameOrFn
  } else {
    methodName = methodNameOrFn.name
    fn = methodNameOrFn
  }

  if (!fn) {
    if (!(methodName in instance)) {
      throw new Error(`Unknown method: ${methodName}`)
    }

    return instance[methodName].bind(instance)
  }

  return (instance[methodName] = context(fn)).bind(instance)
}

export function on<K extends keyof HTMLElementEventMap> (
  type: K, 
  listener: EventListener, 
  options?: boolean | AddEventListenerOptions
): RemoveEventListenerFn
export function on<K extends keyof HTMLElementEventMap> (
  type: K,
  listener: EventListenerObject, 
  options?: boolean | AddEventListenerOptions
): RemoveEventListenerFn
export function on<K extends keyof HTMLElementEventMap> (
  type: K,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
): RemoveEventListenerFn {
  const instance = getElementInstance()

  /* istanbul ignore next */
  if (typeof listener === 'object') {
    listener = listener.handleEvent.bind(listener)
  }

  listener = context(listener as any)
  instance.addEventListener(type, listener, options)

  return () => {
    instance.removeEventListener(type, listener, options)
  }
}

function createWatchableValue<T> (
  watcherHandler: WatcherHandler, 
  descriptor: { get: () => T, set: (newValue: T) => void }
): WatchableValue<T> {
  return Object.seal({
    get value () {
      return descriptor.get()
    },
    set value (newValue: T) {
      descriptor.set(newValue)
    },
    watch: watcherHandler.addWatcher.bind(watcherHandler)
  })
}

function getCallbackComposer<T extends keyof NovaElementCallbacks> (callbackName: T) {
  return (fn: NovaElementCallbacks[T]) => {
    const instance = getElementInstance()

    return instance.__attachCallback(callbackName, context(fn))
  }
}
