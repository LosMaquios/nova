import { WatcherHandler } from './WatcherHandler'

export class WatcherCollection<K = string> {
  collection = new Map<K, WatcherHandler>()

  has (name: K) {
    return this.collection.has(name)
  }

  forceGet (name: K) {
    return this.collection.get(name)
  }

  get (name: K, setup?: (watcherHandler: WatcherHandler) => void) {
    if (this.collection.has(name)) {
      return this.collection.get(name)
    }

    const watcherHandler = new WatcherHandler()

    if (setup) {
      setup(watcherHandler)
    }
  
    this.collection.set(name, watcherHandler)
    return watcherHandler
  }
}
