import { 
  setElementInstance, 
  NovaElementCallbacks,
  NovaElementInternals,
  NovaFunctionalElementConstructor
} from './apiInstance'
import { WatcherHandler } from './watcherHandler'

export interface DefineOptions {
  tag?: string
  type?: keyof HTMLElementTagNameMap
}

let novaElementID = 0
const constructorCache = new Map<string, HTMLElementTagNameMap[keyof HTMLElementTagNameMap]>()

function getElementConstructorFromType<
  T extends keyof HTMLElementTagNameMap,
  K extends HTMLElementTagNameMap[T]
> (type: T): K {
  if (constructorCache.has(type)) {
    return constructorCache.get(type) as K
  }

  const element = document.createElement(type)
  const Constructor: K = element.constructor as any

  constructorCache.set(type, Constructor)

  return Constructor
}

function genCustomElementID () {
  return `nova__${Math.random().toString().slice(2)}__id_${++novaElementID}` 
}

function toKebabCase (str: string) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

function getCustomElementConstructor<T extends keyof HTMLElementTagNameMap> (
  type: T, 
  FunctionalElementConstructor: NovaFunctionalElementConstructor
): any {
  let HTMLConstructor: any = HTMLElement

  if (type) {
    HTMLConstructor = getElementConstructorFromType(type)
  }

  class NovaElement extends HTMLConstructor implements NovaElementInternals {
    __id: string
    __constructor = FunctionalElementConstructor
    __watchedAttrs = new Map()
    __watchedProps = new Map()
    __callbacks = {
      connected: [],
      disconnected: [],
      adopted: [],
      attributeChanged: []
    }

    constructor () {
      super()

      this.__id = genCustomElementID()

      setElementInstance(this as any)      
      FunctionalElementConstructor()
      setElementInstance(null)
    }

    connectedCallback () {
      this.__dispatchCallback('connected')
    }

    disconnectedCallback () {
      this.__dispatchCallback('disconnected')
    }

    attributeChangedCallback (...args) {
      this.__dispatchCallback('attributeChanged', args)
    }

    adoptedCallback (...args) {
      this.__dispatchCallback('adopted', args)
    }

    __registerWatchedAttr (attr) {
      if (this.__watchedAttrs.has(attr)) {
        return this.__watchedAttrs.get(attr)
      }
      
      const watcherHandler = new WatcherHandler()

      this.__attachCallback('attributeChanged', ([name, oldValue, newValue, domain]) => {
        if (name === attr) {
          watcherHandler.run(newValue, oldValue, domain)
        }
      })

      return watcherHandler
    }

    __registerWatchedProp (prop, defaultValue) {
      if (this.__watchedProps.has(prop)) {
        return this.__watchedProps.get(prop)
      }

      let currentValue: any = prop in this ? this[prop] : defaultValue
      const watcherHandler = new WatcherHandler()

      Object.defineProperty(this, prop, {
        get () {
          return currentValue
        },
        set (newValue) {
          if (currentValue !== newValue) {
            const oldValue = currentValue
            watcherHandler.run(currentValue = newValue, oldValue)
          }
        }
      })

      return watcherHandler
    }

    __attachCallback (callbackName, fn) {
      const callbacks = this.__callbacks[callbackName]

      callbacks.push(fn)

      return () => {
        callbacks.splice(callbacks.indexOf(fn), 1)
      }
    }

    private __dispatchCallback (callbackName: keyof NovaElementCallbacks, args: any[] = []) {
      const callbacks = this.__callbacks[callbackName]

      for (const callback of callbacks) {
        callback(...args)
      }
    }
  }

  return NovaElement
}

export function defineElement (FunctionalElementConstructor: NovaFunctionalElementConstructor, options: DefineOptions = {}) {
  const { tag, type } = options

  const defineArgs: [any, any] = [
    tag ?? toKebabCase(FunctionalElementConstructor.name), 
    getCustomElementConstructor(type, FunctionalElementConstructor)
  ]

  if (type) {
    defineArgs.push({ extends: type })
  }

  window.customElements.define(...defineArgs)
}
