import * as WebSocket from 'ws'
import { omit
       , compose
       } from 'rambda'
import xs, {Stream} from 'xstream'

import { InternalDATA
       , InternalSelf
       , CONNECTION_UID
       } from './types'

import { onlyAction } from './../utils/message-helpers'

const wsOptions =
  { port: 8080
  }

const wss = new WebSocket.Server(wsOptions)

type Message =
  { TYPE: string
  , DATA?: any
  }

type InternalMessage =
  InternalSelf
  & Message

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

type HandleIncommingMessages =
  (UID:CONNECTION_UID, listener:any) => (message:string) => void
const handleIncommingMessages: HandleIncommingMessages =
  (UID, listener) =>
    compose
    ( (message:InternalMessage) => { listener.next(message) }
    , addInternalData({_to: 'SELF', _UID: UID})
    , JSON.parse
    )

type SendMessage =
  (ws:any) => (message: InternalMessage) => void
const sendMessage: SendMessage =
  (ws) =>
    (message) => {
      const JSONMessage = JSON.stringify(message)
      ws.send
         ( JSONMessage
         , (err:any) => {
             if (err !== undefined) {
               console.error(err)
             }
           }
         )
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

type MayHaveError = (message: InternalMessage) => boolean
const mayHaveError: MayHaveError =
  ({ TYPE, _self}) =>
    TYPE !== 'ERROR'
      ? true
      : _self._show === true

type MessageProducer =
  { start: (listener:any) => void
  , stop: () => void
  }

type MessageSink = Stream<InternalMessage>
type PickEvent = (messageType: string) => Stream<any>
type MessageSource =
  { all$: Stream<InternalMessage>
  , pick: PickEvent
  }
type MakeMessageDriver =
  (port:number) =>
    (actions$: MessageSink) =>
      MessageSource
const makeMessageDriver: MakeMessageDriver =
  (port) =>
    (actions$) => {

      const messageProducer: MessageProducer =
        { start: (listener) => {
            wss
              .on
               ( 'connection'
               , (ws:any, req:any) => {
                   const UID = Date.now().toString(16)
                   actions$
                     .filter(mayHaveMessage(UID))
                     .map(removeInternalData)
                     .addListener
                      ( { next: sendMessage(ws)
                        , error: (err) => { console.log(err) }
                        }
                      )

                   ws
                     .on
                      ( 'message'
                      , handleIncommingMessages(UID, listener)
                      )
                 }
               )
          }
        , stop: () => {
            console.log(`Not yet implemented`)
          }
        }

      const messages$: Stream<InternalMessage> =
        xs.create(messageProducer)

      const pickEvent: PickEvent =
        (messageType) =>
          onlyAction
          ( messageType )
          ( messages$ )

      return (
        { all$: messages$
        , pick: pickEvent
        }
      )
    }

export
  { MessageSink
  , MessageSource
  , InternalMessage
  , InternalDATA
  , makeMessageDriver
  }
