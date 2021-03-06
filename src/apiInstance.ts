import { WatcherHandler } from './WatcherHandler'
import { WatcherCollection } from './WatcherCollection'

export type NovaElementCallbackDetachFn = () => void
export type NovaElementConnectedCallback = () => void
export type NovaElementDisconnectedCallback = () => void
export type NovaElementAdoptedCallback = (oldDocument: Document, newDocument: Document) => void
export type NovaElementAttributeChangedCallback = (
  name: string,
  oldValue: string | null,
  newValue: string | null,
  domain: string
) => void

export interface NovaFunctionalElementConstructor {
  (): void
}

export interface NovaElementCallbacks {
  connected: NovaElementConnectedCallback
  disconnected: NovaElementDisconnectedCallback
  adopted: NovaElementAdoptedCallback
  attributeChanged: NovaElementAttributeChangedCallback
}

export interface NovaElementInternals {
  /**
   * Nova assigned ID
   */
  __id: string
  __mutationObserver: MutationObserver
  __constructor: NovaFunctionalElementConstructor
  __watchedAttrs: WatcherCollection<string>
  __watchedProps: WatcherCollection<PropertyKey>
  __callbacks: WatcherCollection<keyof NovaElementCallbacks>

  __registerWatchedAttr: (attr: string) => WatcherHandler
  __registerWatchedProp: (prop: PropertyKey, defaultValue?: any) => WatcherHandler
  __attachCallback: <T extends keyof NovaElementCallbacks>(callbackName: T, fn: NovaElementCallbacks[T]) => NovaElementCallbackDetachFn
  connectedCallback: NovaElementConnectedCallback
  disconnectedCallback: NovaElementDisconnectedCallback
  adoptedCallback: NovaElementAdoptedCallback
  attributeChangedCallback: NovaElementAttributeChangedCallback
}

export type NovaElementInstance<T extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap> = HTMLElementTagNameMap[T] & NovaElementInternals

let currentElementInstance: NovaElementInstance = null

export function getElementInstance<T extends keyof HTMLElementTagNameMap> (): NovaElementInstance<T> {
  if (!currentElementInstance) {
    throw new Error('Unknown instance')
  }

  return currentElementInstance as any
}

export function setElementInstance<T extends keyof HTMLElementTagNameMap> (instance: NovaElementInstance<T> | null) {
  currentElementInstance = instance
}

export function context<T extends (...args: unknown[]) => any> (fn: T): T {
  const currentContext = getElementInstance()

  const wrapper = function (...args: unknown[]): any {
    let prevInstance = null

    try {
      prevInstance = getElementInstance()
    } catch (err) {
      // Ignore "Unknown instance" error
    }

    setElementInstance(currentContext)
    const result = fn.call(this, ...args)
    setElementInstance(prevInstance)

    return result
  }

  return wrapper as any
}
