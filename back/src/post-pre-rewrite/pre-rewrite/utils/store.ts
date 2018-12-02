import { promises
       , readFileSync
       , accessSync
       , constants
       } from 'fs'

const { readFile, writeFile } = promises

const readJSONSync =
  (filePath: string) => JSON.parse(readFileSync(filePath, 'utf8'))

const writeJSON =
  (filePath: string, data: object) =>
    Promise.resolve(data)
      .then(JSON.stringify)
      .then( (dataJSON: string) => writeFile(filePath, dataJSON))

type StoreData = null
type WatcherId = string
type WatcherCallback = (data:StoreData) => void
type Watcher = WatcherCallback | null

type StoreMethods<T> =
  { get: () => Promise<T>
  , set: (newData: T) => Promise<void>
  , watch: (cb: Watcher) => void
  , ignore: () => void
  }

type Store = <T>(key: string, initData: T) => StoreMethods<T>
type JsonStore = (directory:string, persist?: boolean) => Store
const jsonStore: JsonStore =
  (directory, persist = true) =>
    (key, initData) => {
      const JSON_PATH = `${directory}/${key}.json`

      let data: typeof initData
      let watcher: Watcher = null

      const present =
        (newData: any) => {
          if (watcher !== null) {
            watcher(newData)
          }
        }

      const write =
        (newData: any) => {
          if (persist) {
            writeJSON(JSON_PATH, newData)
              .catch( (e) => {throw new Error(e)})
          }
        }

      if (persist) {
        try {
          accessSync(JSON_PATH, constants.R_OK | constants.W_OK)
          data = readJSONSync(JSON_PATH)
        } catch {
          data = initData
          write(initData)
        }
      } else {
        data = initData
      }

      return (
        { get: () => Promise.resolve(data)
        , set: (newData) =>
            Promise.resolve()
              .then(() => { data = newData })
              .then(() => present(newData))
              .then(() => write(newData))
        , watch: (cb) => { watcher = cb }
        , ignore: () => { watcher = null }
        }
      )
    }

export
  { jsonStore
  }
