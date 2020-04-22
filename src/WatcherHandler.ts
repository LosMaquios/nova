export type Watcher = (...args: unknown[]) => any
export type RemoveWatcherFn = () => void

export class WatcherHandler extends Set<Watcher> {
  addWatcher (watcher: Watcher): RemoveWatcherFn {
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
