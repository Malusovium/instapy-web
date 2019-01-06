import xs, { Stream } from 'xstream'
import { EventEmitter } from 'events'
import
  { ControlManager
  , Watcher
  } from 'utils/bot-controls'
import { api } from 'instapy-tools'
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

const { raw, setupMethod, setupCreate } = api

const toPythonMethod = setupMethod(raw)
const toPythonCreate = setupCreate(true, INSTAPY_LOCATION)

const setupStatusStream =
  (status: Watcher) =>
    (action$: Stream<any>) => {
      const setupStatusProducer =
        () => {
          let statusCb: (status:string) => void

          return (
            { start:
                (listener:any) => {
                  statusCb =
                    (botStatus:string) => {
                      listener.next(botStatus)
                    }
                  status.add(statusCb)
                }
            , stop:
                () => {
                  status.remove(statusCb)
                }
            }
          )
        }

      const statusProducer =
        { start:
            (listener: any) => {
              action$
                .filter(propEq('TYPE', 'START_STATUS'))
                .addListener
                 ( { next:
                      () => {
                        const status$ = xs.create(setupStatusProducer())
                        listener.next(status$)
                      }
                   }
                 )
            }
        , stop: () => {}
        }

      const start$ = xs.create(statusProducer)

      const stop$ =
        action$
          .filter(propEq('TYPE', 'STOP_LOGS'))
          .mapTo(xs.never())

      return xs.merge(start$, stop$)
    }

const setupLogsStream =
  (logs: Watcher) =>
    (action$: Stream<any>) => {
      const setupLogProducer =
        () => {
          let logCb: (status: string) => void
          return (
            { start:
                (listener:any) => {
                  logCb =
                    (log:string) => {
                      listener.next(log)
                    }
                  logs.add(logCb)
                }
            , stop:
                () => {
                  logs.remove(logCb)
                }
            }
          )
        }

      const logProducer =
        { start:
            (listener: any) => {
              action$
                .filter(propEq('TYPE', 'START_LOGS'))
                .addListener
                 ( { next:
                      () => {
                        const log$ = xs.create(setupLogProducer())
                        listener.next(log$)
                      }
                   }
                 )
            }
        , stop: () => {}
        }

      const start$ = xs.create(logProducer)

      const stop$ =
        action$
          .filter(propEq('TYPE', 'STOP_LOGS'))
          .mapTo(xs.never())

      return xs.merge(start$, stop$)
    }

const handleControlActions =
  (controlManager:any, setConfig: SetConfig) =>
    (action$: Stream<any>) => {
      action$
        .filter(propEq('TYPE', 'START'))
        .addListener
         ( { next:
               () => {
                 controlManager
                   .start()
               }
           }
         )

      action$
        .filter(propEq('TYPE', 'STOP'))
        .debug('well')
        .addListener
         ( { next:
               () => {
                 controlManager
                   .stop()
               }
           }
         )

      action$
        .filter(propEq('TYPE', 'BUILD'))
        .map(path('DATA'))
        .map(map(toPythonMethod))
        .addListener
         ( { next:
               (pythonLines: any) => {
                 toPythonCreate(pythonLines, true)
               }
           }
         )

      action$
        .filter(propEq('TYPE', 'SET_CONFIG'))
        .map(path('DATA.config'))
        .addListener
         ( { next:
               (nextConfig:any) => {
                 setConfig(nextConfig)
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
  , controlManager: ControlManager
  }
type MakeBotDriver =
  (neededFns: NeededFns) =>
    (action$: BotSink) =>
      BotSource
const makeBotDriver: MakeBotDriver =
  ( { controlManager
    , getConfig
    , setConfig
    }
  ) =>
    (action$) => {
      handleControlActions
      ( controlManager, setConfig )
      ( action$.debug('bot in') )

      const status$ =
        setupStatusStream
        (controlManager.status)
        (action$)
      const logs$ =
        setupLogsStream
        (controlManager.logs)
        (action$)
      const configProducer =
        setupConfigProducer
        (getConfig)
        (action$.filter(propEq('TYPE', 'GET_CONFIG')))

      return (
        { status$: status$
        , config$: xs.create(configProducer)
        , logs$: logs$
        }
      )
    }

export
  { BotSource
  , BotSink
  , makeBotDriver
  }
