import * as uuidv4 from 'uuid/v4'
import { findIndex
       , find
       , compose
       , map
       , filter
       , path
       } from 'rambda'

type SessionID = string
type Message = string | number
type WS = any
type Req = any

type CreateSession = (ws:any, sessionID: SessionID) => Dispose
type Dispose = () => void
type Session =
  { sessionID: SessionID
  , socket: WS
  , dispose: Dispose
  , aliveSince: Date
  , lastHeartBeat: Date
  }
type SessionList = Session[]

type AddSession = (ws: WS, req: Req) => void
type RemoveSession = (sessionID: SessionID) => void
type UpdateHeartBeat = (sessionID: SessionID) => void
type GetSessionsLength = () => number

type SessionHandlerMethods =
  { add: AddSession
  , remove: RemoveSession
  , updateHeartBeat: UpdateHeartBeat
  , getSessionsLength: GetSessionsLength
  }

type SetupSessionHandler =
  (createSession: CreateSession) =>
    SessionHandlerMethods

const createUID = () => uuidv4()
type IsConnectionID =
  (searchSessionID: SessionID) =>
    (session: Session) => boolean
const isConnectionID: IsConnectionID =
  (searchSessionID) =>
    ({sessionID}) =>
      searchSessionID === sessionID

type DestroySession =
  (session: Session) =>
    void

const destroySession: DestroySession =
  (session) => {
    if (session !== undefined) {
      if (session.socket !== undefined) {
        session.socket.terminate()
      }
      if (typeof session.dispose === 'function') {
        session.dispose()
      }
      console.log('Session cleared:', session.sessionID)
    } else {
      console.error('No session given')
    }
  }

type IsDeadHeartBeat =
  (maxDifference: number) =>
    (compareDate: Date) =>
      (session: Session) =>
        boolean
const isDeadHeartBeat: IsDeadHeartBeat =
  (maxDifference) =>
    (compareDate) =>
      ({lastHeartBeat}) =>
        (compareDate.getTime() - lastHeartBeat.getTime()) >= maxDifference

type GetDeadSessionIDList =
  (maxDifference: number) =>
    (compareDate: Date) =>
      (sessionList: SessionList) =>
        SessionID[]
const getDeadSessionIDList: GetDeadSessionIDList =
  (maxDifference) =>
    (compareDate) =>
      compose
      <any, any, any>
      ( map(path('sessionID'))
      , filter(isDeadHeartBeat(maxDifference)(compareDate))
      )

const setupSessionHandler: SetupSessionHandler =
  (createSession) => {
    let sessionList: SessionList = []

    const ripSessionBySessionID =
      (sessionID: SessionID) => {
        const sessionIndex =
          findIndex
          ( isConnectionID(sessionID)
          , sessionList
          )

        if (sessionIndex === -1) {
          return null
        } else {
          return sessionList.splice(sessionIndex, 1)[0]
        }
      }

    const removeSession: RemoveSession =
      (sessionID) => {
        const session = ripSessionBySessionID(sessionID)

        if (session === null) {
          console.error(`session dosen't exist`)
        } else {
          destroySession(session)
        }
      }


    const updateHeartBeat: UpdateHeartBeat =
      (sessionID) => {
        const session = ripSessionBySessionID(sessionID)
        if (session === null) {
          console.error('session not found')
        } else {
          const newStamp = new Date(Date.now())
          sessionList
            .push
             ( { ...session
               , lastHeartBeat: newStamp
               }
             )
        }
      }

    const pingAll =
      () => {
        compose<any, any, any>
        ( map((socket:any) => { socket.ping(() => { console.log('pinged') }) })
        // , (val) => { console.log(val); return val}
        , map(path('socket'))
        )(sessionList)

        console.log(sessionList)

        setTimeout
        ( pingAll
        , 1000
        )
      }

    const removeDeadSessions =
      () => {
        const deadSessionIDList =
          getDeadSessionIDList
          (4000)
          (new Date(Date.now()))
          (sessionList)
        console.log(`DeadSessions:`, deadSessionIDList)
        deadSessionIDList
          .map(removeSession)
        setTimeout
        ( removeDeadSessions
        , 3000
        )
      }

    pingAll()
    removeDeadSessions()

    return (
      { add:
          (ws, req) => {
            const sessionID = createUID()
            const disposeSession = createSession(ws, sessionID)
            const connectedAt = new Date(Date.now())
            sessionList
              .push
               ( { sessionID: sessionID
                 , socket: ws
                 , dispose: disposeSession
                 , aliveSince: connectedAt
                 , lastHeartBeat: connectedAt
                 }
               )
            ws.on('pong', () => {updateHeartBeat(sessionID)})
            console.log(`session added`, sessionID)
          }
      , remove: removeSession
      , updateHeartBeat: updateHeartBeat
      , getSessionsLength:
          () => {
            return sessionList.length
          }
      }
    )
  }

export
  { setupSessionHandler
  }
