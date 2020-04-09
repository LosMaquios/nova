export type Watcher = (...args: unknown[]) => any

export class WatcherHandler extends Set<Watcher> {
  addWatcher (watcher: Watcher) {
    super.add(watcher)

    return () => {
      super.delete(watcher)
    }
  }

  run (...args: unknown[]) {
    for (const watcher of this) {
      watcher(...args)
    }
  }
}
