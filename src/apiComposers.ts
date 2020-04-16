import { 
  NovaElementCallbacks, 
  getElementInstance,
  NovaElementInstance,
  context
} from './apiInstance'

export type NovaElementMethodDefinition = (...args: unknown[]) => unknown
export type NovaElementMethodDefinitionBound = (this: NovaElementInstance<any>, ...args: unknown[]) => unknown

export const onConnected = getCallbackComposer('connected')
export const onDisconnected = getCallbackComposer('disconnected')
export const onAttributeChanged = getCallbackComposer('attributeChanged')
export const onAdopted = getCallbackComposer('adopted')

export function attr (name: string) {
  const instance = getElementInstance()
  const watcherHandler = instance.__registerWatchedAttr(name)

  return {
    get value () {
      return instance.getAttribute(name)
    },
    set value (newValue: string) {
      instance.setAttribute(name, newValue)
    },
    watch: watcherHandler.addWatcher.bind(watcherHandler)
  }
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
