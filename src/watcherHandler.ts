export type Watcher = (...args: unknown[]) => any

export class WatcherHandler {
  watchers = new Set<Watcher>()

  addWatcher (watcher: Watcher) {
    this.watchers.add(watcher)

    return () => {
      this.watchers.delete(watcher)
    }
  }

  run (...args: unknown[]) {
    for (const watcher of this.watchers) {
      watcher(...args)
    }
  }
}
