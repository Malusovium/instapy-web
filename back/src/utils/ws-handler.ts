import * as uuidv4 from 'uuid/v4'
import { findIndex
       , find
       } from 'rambda'

type ConnectionID = string
type Message = string | number
type WS = any
type Req = any

type InternalInMessage =
  { connectionID: ConnectionID
  , message: Message | object
  }
type InternalOutMessage =
  { connectionID: ConnectionID
  , message: Message
  }

type Session =
  { connectionID: ConnectionID
  , socket: WS
  }
type SessionList = Session[]

type Receiver = (internalMessage: InternalInMessage) => void

type Add = (ws: WS, req: Req) => void
type Remove = (connectionID: ConnectionID) => void
type Send = (internalMessage: InternalOutMessage) => void
type Receive = (receiver: Receiver) => void

type WsHandlerMethods =
  { add: Add
  , remove: Remove
  , send: Send
  , receive: Receive
  }

type Transform =
  { toIn: (message: Message) => any
  , toOut: (internalMessage: any) => Message
  }

type WsHandler = (transform: Transform) => WsHandlerMethods

const createUID = () => uuidv4()
type IsConnectionID =
  (searchConnectionID: ConnectionID) =>
    (session: Session) => boolean
const isConnectionID: IsConnectionID =
  (searchConnectionID) =>
    ({connectionID}) =>
      searchConnectionID === connectionID

const makeWsHandler: WsHandler=
  ({toIn, toOut}) => {
    let sessionList: SessionList = []
    let _receiver: Receiver = (_) => { console.error(`whoopsie no receiver`) }

    return (
      { add:
          (ws, req) => {
            const connectionID = createUID()
            ws.on
               ( 'message'
               , (message: Message) => {
                   _receiver
                   ( { connectionID: connectionID
                     , message: toIn(message)
                     }
                   )
                 }
               )
            sessionList
              .push
               ( { connectionID: connectionID
                 , socket: ws
                 }
               )
            console.log(sessionList)
          }
      , remove:
          (connectionID) => {
            const sessionIndex =
              findIndex
              ( isConnectionID(connectionID)
              , sessionList
              )

            if (sessionIndex === -1) {
              console.error(`session dosen't exist`)
            } else {
              const session = sessionList.splice(sessionIndex, 1)[0]
              session.socket.terminate()
            }
          }
      , send:
          ({ connectionID, message }) => {
            console.log(connectionID)
            console.log(message)
            const session =
              find
              ( isConnectionID(connectionID)
              , sessionList
              )

            if (session === undefined) {
              console.error(`session dosen't exist`)
            } else {
              session
                .socket
                .send
                 ( toOut(message)
                 , console.error
                 )
            }
          }
      , receive: (newReceiver) => { _receiver = newReceiver }
      }
    )
  }

export
  { makeWsHandler
  }
