import * as WebSocket from 'ws'
import {omit} from 'rambda'
import xs, {Stream} from 'xstream'

const wsOptions =
  { port: 8080
  }

const wss = new WebSocket.Server(wsOptions)

type User = string
type Group = string

type CONNECTION_UID =
  string

type AddInternalData =
  (internalDATA: InternalDATA) =>
    (message: Message) => InternalMessage
const addInternalData: AddInternalData =
  (internalDATA: InternalDATA) =>
    (message) => (
      { ...message
      , _self: internalDATA
      }
    )
type RemoveInternalData =
  (message: Message) => Message
const removeInternalData: RemoveInternalData =
  (message) => omit('_self', message)

type Message =
  { TYPE: string
  , DATA?: any
  }

type InternalDATA =
  { _UID: string
  , _to?: 'ALL' | 'SELF'
  }

type InternalMessage =
  { _self: InternalDATA
  } & Message

type SendMessage =
  (ws:any) => (message: InternalMessage) => void
const sendMessage: SendMessage =
  (ws) =>
    (message) => {
      const JSONMessage = JSON.stringify(message)
      ws.send(JSONMessage, (err:any) => { console.log(err)})
    }

type MessageQueue =
  any[]
let messageQueue: MessageQueue =
  []

type PushMessageQueue =
  (_connectionUID: CONNECTION_UID) => (message: string) => void
const pushMessageQueue: PushMessageQueue =
  (_connectionUID) =>
    (message) => {
      const inMessage: InternalMessage =
        { ...JSON.parse(message)
        , _self:
          { _UID: _connectionUID
          , _to: 'SELF'
          }
        }
      messageQueue.push(inMessage)
    }

type MessageProducerId = any
let messageProducerId: MessageProducerId = 0

const sendMessageQueue =
  (listener:any) => {
    if(messageQueue.length <= 0) {
      return
    } else {
      const nextMessage = messageQueue.shift()
      listener.next(nextMessage)
      sendMessageQueue(listener)
    }
  }

type MessageProducer =
  { start: (listener:any) => void
  , stop: () => void
  }
let messageProducer: MessageProducer =
  { start:
      (listener) => {
        messageProducerId =
          setInterval
          ( () => {
              if(messageQueue.length <= 0) {
                return
              } else {
                sendMessageQueue(listener)
              }
            }
          , 100
          )
      }
  , stop:
      () => {
        clearInterval(messageProducerId)
      }
  }

type MayHaveMessage =
  (UID: CONNECTION_UID) =>
    (message: InternalMessage) => boolean
const mayHaveMessage: MayHaveMessage =
  (UID) =>
    ({_self}) =>
      _self._to === 'ALL' ? true
      : _self._to === 'SELF' ? _self._UID === UID
      : false

type MessageDriverSources = Stream<InternalMessage>
type MessageDriverSinks =
  { all$: Stream<InternalMessage>
  }
type MakeMessageDriver =
  (port:number) =>
    (actions$: MessageDriverSources) =>
      MessageDriverSinks
const makeMessageDriver: MakeMessageDriver =
  (port) =>
    (actions$) => {
      const connection =
        (ws:any, req:any) => {
          const UID = Date.now().toString(16)
          actions$
            .filter(mayHaveMessage(UID))
            .addListener
             ( { next: sendMessage(ws)
               }
             )

          ws.on('message', pushMessageQueue(UID))
        }

      wss
        .on
         ( 'connection'
         , connection
         )

      const messages$: Stream<InternalMessage> = xs.create(messageProducer)

      return (
        { all$: messages$
        }
      )
    }

export
  { MessageDriverSinks
  , MessageDriverSources
  , InternalMessage
  , makeMessageDriver
  }
