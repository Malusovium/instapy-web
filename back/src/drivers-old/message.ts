import * as WebSocket from 'ws'
import xs, {Stream} from 'xstream'

const wsOptions =
  { port: 8080
  }

const wss = new WebSocket.Server(wsOptions)

type Action =
  { TYPE: string
  , DATA?: any
  }

type SendMessage =
  (ws:any) => (message: Action) => void
const sendMessage: SendMessage =
  (ws) =>
    (message) => {
      ws.send(message)
    }

const message =
  (actions$: Stream<Action>) => {
    const connection =
      (ws:any, req:any) => {
        actions$
          .addListener
           ( { next: sendMessage(ws)
             }
           )
      }

    wss
      .on
       ( 'connection'
       , message
       )

    return xs.from(ws.on('message'))
  }
