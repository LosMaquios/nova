import { 
  NovaElementCallbacks, 
  getElementInstance,
  NovaElementInstance,
  context
} from './apiInstance'
import { WatcherHandler } from './WatcherHandler'

export type NovaElementMethodDefinition = (...args: unknown[]) => any

export interface WatchableValue<K, V> {
  name: K
  value: V
}

export type UnwatchFn = () => void
export type RemoveEventListenerFn = () => void

export const onConnected = getCallbackComposer('connected')
export const onDisconnected = getCallbackComposer('disconnected')
export const onAttributeChanged = getCallbackComposer('attributeChanged')
export const onAdopted = getCallbackComposer('adopted')

export function attr (name: string): WatchableValue<string, string> {
  const instance = getElementInstance()
  
  // Register attr
  instance.__registerWatchedAttr(name)

  return Object.seal({
    name,
    get value () {
      return instance.getAttribute(name) as any
    },
    set value (newValue: string) {
      instance.setAttribute(name, newValue)
    }
  })
}

export function prop<K extends keyof NovaElementInstance, T extends NovaElementInstance[K]> (name: K, defaultValue?: T): WatchableValue<K, T>
export function prop<T> (name: PropertyKey, defaultValue?: T): WatchableValue<PropertyKey, T>
export function prop<T> (name: PropertyKey, defaultValue?: T): WatchableValue<PropertyKey, T> {
  const instance = getElementInstance()
  
  // Register prop
  instance.__registerWatchedProp(name, defaultValue)

  return Object.seal({
    name,
    get value () {
      return instance[name]
    },
    set value (newValue: T) {
      instance[name] = newValue
    }
  })
}

export function watch (
  value: WatchableValue<PropertyKey, any>,
  watchFn: (newValue: any, oldValue: any) => void
): UnwatchFn {
  let watcherHandler: WatcherHandler
  const instance = getElementInstance()

  if (typeof value.name === 'string') {
    watcherHandler = instance.__watchedAttrs.forceGet(value.name)
  }

  watcherHandler = watcherHandler ?? instance.__watchedProps.forceGet(value.name)

  if (!watcherHandler) {
    throw new Error('Given `value` is not watchable')
  }

  return watcherHandler.addWatcher(watchFn)
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

function getCallbackComposer<T extends keyof NovaElementCallbacks> (callbackName: T) {
  return (fn: NovaElementCallbacks[T]) => {
    const instance = getElementInstance()

    return instance.__attachCallback(callbackName, context(fn))
  }
}
