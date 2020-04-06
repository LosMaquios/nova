import { WatcherHandler } from './WatcherHandler'

export class WatcherCollection<K = string> extends Map<K, WatcherHandler> {
  forceGet (name: K) {
    return super.get(name)
  }

  get (name: K, setup?: (watcherHandler: WatcherHandler) => void) {
    if (super.has(name)) {
      return super.get(name)
    }

    const watcherHandler = new WatcherHandler()

    if (setup) {
      setup(watcherHandler)
    }

    super.set(name, watcherHandler)
    return watcherHandler
  }
}
