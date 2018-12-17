import xs, { Stream } from 'xstream'
import { EventEmitter } from 'events'
import { controls
       , api
       } from 'instapy-tools'
import
  { equals
  , compose
  , map
  , path
  , propEq
  , tail
  } from 'rambda'

const DATA_LOCATION =
  process.env.DATA_PATH
  || `${__dirname}/../../../../../data`
const INSTAPY_LOCATION = `${DATA_LOCATION}/InstaPy`
const botControl = controls(INSTAPY_LOCATION)

const { raw, setupMethod, setupCreate } = api

const toPythonMethod = setupMethod(raw)
const toPythonCreate = setupCreate(INSTAPY_LOCATION)

const uniquelyAppendable =
  ( source: any[]
  , toAppend: any[]
  ): any[] =>
    source[0] === undefined ? toAppend
    : source[0] === toAppend[0]
      ? uniquelyAppendable
        ( tail(source)
        , tail(toAppend)
        )
      : uniquelyAppendable
        ( tail(source)
        , toAppend
        )

const setupControlManager =
  () => {
    let botStatus = 'idle'
    let botLogs: string[] = []
    let botStatusWatcher:any =
      { cb: null
      , active: false
      }
    let botLogsWatcher:any =
      { cb: null
      , active: false
      }
    let lastIndexLog = 0

    const _updateStatus =
      () => {
        botControl
          .status()
          .then
           ( (newStatus) => {
               const shouldPresent = botStatus !== newStatus
               botStatus = newStatus
               if (shouldPresent) {
                 _presentStatus()
               }
             }
           )
      }

    const _presentStatus =
      () => {
        if (typeof botStatusWatcher.cb === 'function'
           && botStatusWatcher.active) {
          botStatusWatcher.cb(botStatus)
        }
      }

    const _updateLogs =
      () => {
        botControl
          .logs()
          .then
           ( (newLogs:string[]) => {
               const toAppend =
                 uniquelyAppendable
                 ( botLogs.slice(-40)
                 , newLogs.slice(-30)
                 )

               botLogs =
                 [ ...botLogs
                 , ...toAppend
                 ]
             }
           )
      }

    const _presentLog =
      () => {
        console.log('came here')
        while (botLogs.length > lastIndexLog + 1) {
          if (typeof botLogsWatcher.cb === 'function'
             && botLogsWatcher.active) {
            botLogsWatcher.cb(botLogs[lastIndexLog])
            lastIndexLog = lastIndexLog + 1
          } else {
            break
          }
        }
      }

    setInterval
    ( () => {
        _updateStatus()
        _updateLogs()
      }
    , 1000
    )

    return (
      { start:
          () => {
            botControl.start()
            botLogs = []
          }
      , stop: botControl.stop
      , statusWatcher:
        { set:
            (newWatcher:any) => {
              botStatusWatcher.cb = newWatcher
            }
        , start:
            () => {
              botStatusWatcher.active = true
              _presentStatus()
            }
        , stop: () => { botStatusWatcher.active = false }
        , reset: () => { botStatusWatcher.cb = null }
        }
      , logsWatcher:
        { set:
            (newWatcher:any) => {
              botLogsWatcher.cb = newWatcher
            }
        , start:
            () => {
              botLogsWatcher.active = true
              lastIndexLog = 0
              _presentLog()
            }
        , stop: () => { botLogsWatcher.active = false}
        , reset:
            () => {
              botLogsWatcher.cb = null
            }
        }
      }
    )
  }

// const controlManager = setupControlManager()

type Watcher =
  { set: (cb: (arg:any) => void) => void
  , start: () => void
  , stop: () => void
  , reset: () => void
  }

const setupStatusProducer =
  (statusWatcher: Watcher) => (
    { start:
        (listener:any) => {
          statusWatcher
            .set
             ( (botStatus:string) => {
                 listener.next(botStatus)
               }
             )
        }
    , stop:
        () => {
          statusWatcher
            .reset()
        }
    }
  )

const setupLogsProducer =
  (logsWatcher: Watcher) => (
    { start:
        (listener:any) => {
          logsWatcher
            .set
             ( (log:string) => {
                 listener.next(log)
               }
             )
        }
    , stop:
        () => {
          logsWatcher
            .reset()
        }
    }
  )

const handleControlActions =
  (controlManager:any, setConfig: SetConfig) =>
    (action$: Stream<any>) => {
      action$
        .filter(propEq('TYPE', 'START'))
        .addListener
         ( { next:
               () => {
                 controlManager.start()
               }
           }
         )

      action$
        .filter(propEq('TYPE', 'STOP'))
        .addListener
         ( { next:
               () => {
                 controlManager.stop()
               }
           }
         )

      action$
        .filter(propEq('TYPE', 'BUILD'))
        .map(path('DATA'))
        .map(map(toPythonMethod))
        // .map(toPythonCreate)
        .addListener
         ( { next:
               (pythonLines: any) => {
                 toPythonCreate(pythonLines, true)
               }
           }
         )

      action$
        .filter(propEq('TYPE', 'START_STATUS'))
        .addListener
         ( { next:
              () => {
                controlManager
                  .statusWatcher
                  .start()
              }
           }
         )

      action$
        .filter(propEq('TYPE', 'STOP_STATUS'))
        .addListener
         ( { next:
              () => {
                controlManager
                  .statusWatcher
                  .stop()
              }
           }
         )

      action$
        .filter(propEq('TYPE', 'START_LOGS'))
        .debug('came here')
        .addListener
         ( { next:
              () => {
                controlManager
                  .logsWatcher
                  .start()
              }
           }
         )

      action$
        .filter(propEq('TYPE', 'STOP_LOGS'))
        .addListener
         ( { next:
              () => {
                controlManager
                  .logsWatcher
                  .stop()
              }
           }
         )

      action$
        .filter(propEq('TYPE', 'SET_CONFIG'))
        .addListener
         ( { next:
               (nextConfig:any) => {
                 setConfig(nextConfig)
                   // .catch(() => {})
               }
           }
         )
    }

const setupConfigProducer =
  (getConfig: GetConfig) =>
    (action$: Stream<any>) => {
      return (
        { start:
            (listener:any) => {
              action$
                .addListener
                 ( { next:
                       () => {
                         listener.next(xs.fromPromise(getConfig()))
                       }
                   }
                 )
            }
        , stop:
            () => {}
        }
      )
    }

type GET_CONFIG =
  { TYPE: "GET_CONFIG"
  }
type UPDATE_CONFIG =
  { TYPE: "SET_CONFIG"
  , DATA?: any
  }
type BUILD_CONFIG =
  { TYPE: "BUILD"
  }
type START =
  { TYPE: "START"
  }
type STOP =
  { TYPE: "STOP"
  }

type Action =
  GET_CONFIG
  | UPDATE_CONFIG

type BotSource =
  { status$: Stream<any>
  , config$: Stream<any>
  , logs$: Stream<any>
  }
type BotSink = Stream<Action>

type GetConfig =
  () => Promise<any>
type SetConfig =
  (newData: any) => Promise<void>

type NeededFns =
  { getConfig: GetConfig
  , setConfig: SetConfig
  }
type MakeBotDriver =
  (neededFns: NeededFns) =>
    (action$: BotSink) =>
      BotSource
const makeBotDriver: MakeBotDriver =
  (neededFns) =>
    (action$) => {
      const controlManager = setupControlManager()
      handleControlActions
      ( controlManager, neededFns.setConfig )
      ( action$.debug('bot in') )

      const statusProducer =
        setupStatusProducer(controlManager.statusWatcher)
      const logsProducer =
        setupLogsProducer(controlManager.logsWatcher)
      const configProducer =
        setupConfigProducer
        (neededFns.getConfig)
        (action$.filter(propEq('TYPE', 'GET_CONFIG')))

      return (
        { status$: xs.create(statusProducer)
        , config$: xs.create(configProducer)
        , logs$: xs.create(logsProducer)
        }
      )
    }

export
  { BotSource
  , BotSink
  , makeBotDriver
  }
