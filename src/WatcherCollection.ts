import { WatcherHandler } from './WatcherHandler'

export class WatcherCollection {
  collection = new Map<string, WatcherHandler>()

  get (name: string, setup?: (watcherHandler: WatcherHandler) => void) {
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
