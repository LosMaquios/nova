import { 
  setElementInstance, 
  NovaElementCallbacks,
  NovaElementInternals,
  NovaFunctionalElementConstructor
} from './apiInstance'
import { WatcherCollection } from './WatcherCollection'

export interface DefineOptions {
  tag?: string
  type?: keyof HTMLElementTagNameMap
  observedAttributes?: string[]
}

const { hasOwnProperty } = Object.prototype

let novaElementID = 0
const constructorCache = new Map<string, HTMLElementTagNameMap[keyof HTMLElementTagNameMap]>()

function getElementConstructorFromType<
  T extends keyof HTMLElementTagNameMap,
  K extends HTMLElementTagNameMap[T]
> (type: T): K {
  /* istanbul ignore next */
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

function hasChanged (oldValue: any, newValue: any) {
  return oldValue !== newValue && (oldValue === oldValue || newValue === newValue)
}

function getCustomElementConstructor<T extends keyof HTMLElementTagNameMap> (
  type: T, 
  FunctionalElementConstructor: NovaFunctionalElementConstructor,
  observedAttributes: string[]
): any {
  let HTMLConstructor: any = HTMLElement

  if (type) {
    HTMLConstructor = getElementConstructorFromType(type)
  }

  class NovaElement extends HTMLConstructor implements NovaElementInternals {
    static get observedAttributes () {
      return observedAttributes
    }

    __id: string
    __mutationObserver: MutationObserver
    __constructor = FunctionalElementConstructor
    __watchedAttrs = new WatcherCollection<string>()
    __watchedProps = new WatcherCollection<PropertyKey>()
    __callbacks = new WatcherCollection<keyof NovaElementCallbacks>()

    constructor () {
      super()

      this.__id = genCustomElementID()

      this.__mutationObserver = new MutationObserver(this.__handleMutations)
      this.__mutationObserver.observe(this as any, {
        attributes: true,
        attributeOldValue: true
      })

      setElementInstance(this as any)
      FunctionalElementConstructor()
      setElementInstance(null)
    }

    __handleMutations: MutationCallback = mutations => {
      for (const { attributeName, oldValue } of mutations) {
        if (this.__watchedAttrs.has(attributeName)) {
          this.__watchedAttrs
            .forceGet(attributeName)
            .run(this.getAttribute(attributeName), oldValue)
        }
      }
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
      /**
       * 
        this.__attachCallback('attributeChanged', ([name, oldValue, newValue, domain]) => {
          if (name === attr) {
            watcherHandler.run(newValue, oldValue, domain)
          }
        })
       */

      return this.__watchedAttrs.get(attr)
    }

    __registerWatchedProp (prop, defaultValue) {
      return this.__watchedProps.get(prop, watcherHandler => {
        let currentValue: any = defaultValue

        const setter: PropertyDescriptor['set'] = newValue => {
          /* istanbul ignore else */
          if (hasChanged(currentValue, newValue)) {
            const oldValue = currentValue
            watcherHandler.run(currentValue = newValue, oldValue)
          }
        }

        const descriptor: PropertyDescriptor = {
          configurable: true,
          enumerable: true,
          get () {
            return currentValue
          },
          set: setter
        }

        if (prop in this) {
          let target: any = this

          while (target) {
            if (!hasOwnProperty.call(target, prop)) {
              target = Object.getPrototypeOf(target)
              continue
            }

            const ownDescriptor = Object.getOwnPropertyDescriptor(target, prop)

            if (!ownDescriptor.configurable) {
              return console.warn(
                'Property `' + prop + '` could not be patched.\n' +
                'Any property change made directly in element instance won\'t be tracked.'
              )
            }

            // Merge addition options
            for (const option of ['enumerable', 'writable']) {
              if (ownDescriptor.hasOwnProperty(option)) {
                descriptor[option] = ownDescriptor[option]
              }
            }

            if (!ownDescriptor.get) {
              currentValue = ownDescriptor.value
            } else {
              descriptor.get = function () {
                return currentValue = ownDescriptor.get.call(this)
              }

              // Initial current value
              descriptor.get.call(this)

              if (ownDescriptor.set) {
                descriptor.set = function (newValue: any) {
                  ownDescriptor.set.call(this, newValue)
                  setter(newValue)
                }
              }
            }

            break
          }
        }

        Object.defineProperty(this, prop, descriptor)
      })
    }

    __attachCallback (callbackName, fn) {
      return this.__callbacks.get(callbackName).addWatcher(fn)
    }

    private __dispatchCallback (callbackName: keyof NovaElementCallbacks, args: any[] = []) {
      this.__callbacks.get(callbackName).run(...args)
    }
  }

  return NovaElement
}

export function defineElement (FunctionalElementConstructor: NovaFunctionalElementConstructor, options: DefineOptions = {}) {
  const { tag, type, observedAttributes = [] } = options

  const defineArgs: [any, any] = [
    tag ?? toKebabCase(FunctionalElementConstructor.name), 
    getCustomElementConstructor(type, FunctionalElementConstructor, observedAttributes)
  ]

  if (type) {
    defineArgs.push({ extends: type })
  }

  window.customElements.define(...defineArgs)
}
