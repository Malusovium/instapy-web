import xs, {Stream} from 'xstream'
import { update
       , reject
       } from 'rambda'
import { onlyAction } from './../utils/message-helpers'
import { InternalSelf
       , CONNECTION_UID
       , USER_UID
       } from './types'

type NoSession = null
type ExpireDate = number
type Session =
  { connectionUID: CONNECTION_UID
  , expireAt: ExpireDate
  , permissions: any
  }
type WatcherCallback =
  (session:Session | null) => void
type SessionManagerMethods<T> =
  { set:
      <T>( connectionUID: CONNECTION_UID
         , expireAt: ExpireDate
         , permissions: T
         ) => void
  , watch: (cb:WatcherCallback) => void
  , remove: () => void
  }
type SessionManager =
  <T>(permissions: T) => SessionManagerMethods<T>

const equalConnectionUID =
  (searchConnectionUID: CONNECTION_UID) =>
    ({connectionUID}: Session) => searchConnectionUID === connectionUID

const sessionManager: SessionManager =
  (permissions) => {
    let session: Session | NoSession = null
    let watcher: WatcherCallback | null = null

    const removeAt =
      (expireAt: number) => {
        setTimeout
        ( () => {
            if (session === null || expireAt === session.expireAt) {
              session = null
            }
          }
        , expireAt - Date.now()
        )
      }

    const present =
      () => {
        if (watcher !== null) {
          watcher(session)
        }
      }

    return (
      { set:
          (connectionUID, expireAt, permissions) => {
            session =
              { connectionUID: connectionUID
              , expireAt: expireAt
              , permissions: permissions
              }
            present()
            removeAt(expireAt)
          }
      , watch: (cb) => {
          watcher = cb
        }
      , remove: () => {
          session = null
        }
      }
    )
  }

type SessionProducer =
  <T>(sessionM: SessionManagerMethods<T>) => any
const sessionProducer: SessionProducer =
  (sessionM) => (
    { start:
        (listener:any) => {
          sessionM
            .watch
             ( (session) => {
                 listener.next(session)
               }
             )
        }
    , stop: () => {}
    }
  )

type ADD_ACTION =
  { TYPE: 'ADD'
  , DATA:
    { connectionUID: CONNECTION_UID
    , expireAt: ExpireDate
    }
  } & InternalSelf

type REMOVE_ACTION =
  { TYPE: 'REMOVE'
  , DATA: {}
  } & InternalSelf

type Action =
  ADD_ACTION
  | REMOVE_ACTION

type MakeSessionDriver =
  <T>(permissions: T) =>
    (sessionAction$: Stream<Action>) =>
      Stream<Session | NoSession>
const makeSessionDriver: MakeSessionDriver =
  (permissions) =>
    (sessionAction$) => {
      const sessionM = sessionManager(permissions)

      onlyAction
      ('ADD')
      (sessionAction$)
        .addListener
         ( { next: ({DATA}) => {
               sessionM
                 .set(DATA.connectionUID, DATA.expireAt, permissions)
             }
           }
         )

      onlyAction
      ('REMOVE')
      (sessionAction$)
        .addListener
         ( { next: () => {
               sessionM.remove()
             }
           }
         )

      return xs.create(sessionProducer(sessionM))
    }
