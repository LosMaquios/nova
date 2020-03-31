import { WatcherHandler } from './WatcherHandler'

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
  connected: NovaElementConnectedCallback[]
  disconnected: NovaElementDisconnectedCallback[]
  adopted: NovaElementAdoptedCallback[]
  attributeChanged: NovaElementAttributeChangedCallback[]
}

export type NovaElementWatchedAttrs = Map<string, WatcherHandler>
export type NovaElementWatchedProps = Map<PropertyKey, WatcherHandler>

export interface NovaElementInternals {
  /**
   * Nova assigned ID
   */
  __id: string
  __constructor: NovaFunctionalElementConstructor
  __watchedAttrs: NovaElementWatchedAttrs
  __watchedProps: NovaElementWatchedProps
  __callbacks: NovaElementCallbacks

  __registerWatchedAttr: (attr: string) => WatcherHandler
  __registerWatchedProp: (prop: PropertyKey, defaultValue?: any) => WatcherHandler
  __attachCallback: <T extends keyof NovaElementCallbacks>(callbackName: T, fn: NovaElementCallbacks[T][number]) => () => void
  connectedCallback: NovaElementConnectedCallback
  disconnectedCallback: NovaElementDisconnectedCallback
  adoptedCallback: NovaElementAdoptedCallback
  attributeChangedCallback: NovaElementAttributeChangedCallback
}

export type NovaElementInstance<T extends keyof HTMLElementTagNameMap> = HTMLElementTagNameMap[T] & NovaElementInternals

let currentElementInstance: NovaElementInstance<any> = null

export function getElementInstance<T extends keyof HTMLElementTagNameMap> (): NovaElementInstance<T> {
  if (!currentElementInstance) {
    throw new Error('Unknown instance')
  }

  return currentElementInstance
}

export function setElementInstance<T extends keyof HTMLElementTagNameMap> (instance: NovaElementInstance<T> | null) {
  currentElementInstance = instance
}
