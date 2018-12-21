import xs, { Stream, MemoryStream } from 'xstream'
import dropRepeats from 'xstream/extra/dropRepeats'

import
  { is
  , filter
  , propEq
  , compose
  , path
  , type as rType
  } from 'rambda'

type Connect = string[]

type MessageKind = string
type Message =
  { TYPE: MessageKind
  , DATA?: any
  }

type SuccesMessage =
  { TYPE: 'SUCCES'
  , SUB_TYPE?: string
  }

type ErrorMessage =
  { TYPE: 'ERROR'
  , SUB_TYPE?: string
  , MESSAGE?: string
  }

type IncommingMessage =
  Message
  | SuccesMessage
  | ErrorMessage

type Action =
  Connect | Message

type Watcher<T> =
  (message: T) => void

type SetWatcher =
  (watcher: Watcher<any>) => void

type WatcherControls =
  { set: SetWatcher
  , reset: () => void
  }

type SocketManagerWatchers =
  { connection: Watcher<boolean> | null
  , succes: Watcher<SuccesMessage> | null
  , error: Watcher<ErrorMessage> | null
  , message: Watcher<Message> | null
  }

type ConnectMethod =
  (connect: Connect) => void

type SendMethod =
  (message: Message) => void

const setupSocketManager =
  () => {
    let socket: any = null
    let watchers: SocketManagerWatchers =
      { connection: null
      , succes: null
      , error: null
      , message: null
      }

    const _handleIncommingMessage =
      (message: Message | SuccesMessage | ErrorMessage) => {
        if ((<SuccesMessage>message).TYPE === 'SUCCES') {
          console.log(message)
          if (typeof watchers.succes === 'function') {
            console.log('succes')
            watchers.succes
            (<SuccesMessage> message)
          }
        } else if ((<ErrorMessage>message).TYPE === 'ERROR') {
          if (typeof watchers.error === 'function') {
            console.log('error')
            watchers.error
            (<ErrorMessage> message)
          }
        } else {
          if (typeof watchers.message === 'function') {
            console.log('normal')
            watchers.message
            (<Message> message)
          }
        }
      }

    const _connect: ConnectMethod =
      ([url, protocols]) => {
        socket = new WebSocket(url, protocols)
        socket.onmessage =
          ({data}: any) => {
            const message = JSON.parse(data)
            _handleIncommingMessage(message)
          }
        socket.onclose =
           () => {
             if ( typeof watchers.connection === 'function') {
               watchers.connection(false)
             }
           }

        socket.onopen =
           () => {
             if ( typeof watchers.connection === 'function') {
               watchers.connection(true)
             }
           }
      }

    const _send: SendMethod =
      (message) => {
        if (socket !== null) {
          console.log('came here')
          socket.send(message)
        }
      }

    return (
      { connect: _connect
      , succesWatcher:
        { set:
            (watcher: Watcher<SuccesMessage>) => {
              watchers.succes = watcher
            }
        , reset:
            () => {
              watchers.succes = null
            }
        }
      , errorWatcher:
        { set:
            (watcher: Watcher<ErrorMessage>) => {
              watchers.error = watcher
            }
        , reset:
            () => {
              watchers.error = null
            }
        }
      , messageWatcher:
        { set:
            (watcher: Watcher<Message>) => {
              watchers.message = watcher
            }
        , reset:
            () => {
              watchers.message = null
            }
        }
      , connectionWatcher:
        { set:
            (watcher: Watcher<boolean>) => {
              watchers.connection = watcher
            }
        , reset:
            () => {
              watchers.connection = null
            }
        }
      , send:
          (message: Message) => {
            if (socket !== null) {
              const stringifiedMessage = JSON.stringify(message)
              socket.send(stringifiedMessage)
            }
          }
      }
    )
  }

const setupConnectionProducer =
  (connectionWatcher: WatcherControls) => (
    { start:
        (listener: any) => {
          connectionWatcher
            .set( (connectionStatus: boolean) => {listener.next(connectionStatus)})
        }
    , stop:
        () => {
          connectionWatcher
            .reset()
        }
    }
  )

const setupMessageProducer =
  (messageWatcher: WatcherControls) => (
    { start:
        (listener: any) => {
          messageWatcher
            .set( (message: any) => {listener.next(message)})
        }
    , stop:
        () => {
          messageWatcher
            .reset()
        }
    }
  )

const setupSuccesProducer =
  (succesWatcher: WatcherControls) => (
    { start:
        (listener: any) => {
          succesWatcher
            .set( (succesMessage: any) => {listener.next(succesMessage)})
        }
    , stop:
        () => {
          succesWatcher
            .reset()
        }
    }
  )

const setupErrorProducer =
  (errorWatcher: WatcherControls) => (
    { start:
        (listener: any) => {
          errorWatcher
            .set( (errorMessage: any) => {listener.next(errorMessage)})
        }
    , stop:
        () => {
          errorWatcher
            .reset()
        }
    }
  )

type SetupHandleActions =
  (connect: ConnectMethod, send: SendMethod) =>
    (action$: Stream<Action>) => void

const isType =
  (expected: string) =>
    (value: any) => expected === rType(value)

const setupHandleActions: SetupHandleActions =
  (connect, send) =>
    (action$: Stream<Action>) => {
      action$
        .filter(isType('Array'))
        .addListener
         ( { next: (params) => {
               connect(<Connect>params)
             }
           , error: (err) => { console.error(err) }
           }
         )

      action$
        .filter(isType('Object'))
        .debug('well?')
        .addListener
         ( { next: (message) => {
               send(<Message>message)
             }
           , error: (err) => { console.error(err) }
           }
         )
    }

type BackSink =
  Stream<Action>
type BackSource =
  { connection$: Stream<boolean | {}>
  // { connection$: MemoryStream<boolean>
  , message: (type: string) => Stream<Message>
  // , succes: (subType: string) => Stream<SuccesMessage>
  , succes: (subType: string) => Stream<true>
  , error: (subType: string) => Stream<string>
  }

type MakeBackDriver =
  () =>
    (action$: BackSink) =>
      BackSource
    // { connection$: Stream<boolean>
    // , message: (type: string) => Stream<Message>
    // , succes: (subType: string) => Stream<SuccesMessage>
    // , error: (subType: string) => Stream<ErrorMessage>
    // }

const makeBackDriver: MakeBackDriver =
  () =>
    (action$) => {
      const socketManager = setupSocketManager()
      setupHandleActions
      ( socketManager.connect, socketManager.send )
      ( action$ )

      const connectProducer =
        setupConnectionProducer(socketManager.connectionWatcher)
      const succesProducer =
        setupSuccesProducer(socketManager.succesWatcher)
      const errorProducer =
        setupErrorProducer(socketManager.errorWatcher)
      const messageProducer =
        setupMessageProducer(socketManager.messageWatcher)

      const message$: Stream<Message> =
        xs.create(messageProducer)
      const succes$: Stream<SuccesMessage> =
        xs.create(succesProducer)
      const error$: Stream<ErrorMessage> =
        xs.create(errorProducer)

      return (
        { connection$:
            xs.create(connectProducer)
              .startWith(false)
              .compose(dropRepeats())
        , message:
            (type) =>
              message$
                .debug('inMessage')
                .filter(propEq('TYPE', type))
                // .debug('Message')
                .map(path('DATA'))
        , succes:
            (subType) =>
              succes$
                .filter(propEq('SUB_TYPE', subType))
                .debug('Succes')
                .mapTo<true>(true)
                .debug('Succes, mapped')
        , error:
            (subType) =>
              error$
                .filter(propEq('SUB_TYPE', subType))
                .debug('Error')
                .map(path('MESSAGE'))
        }
      )
    }

export
  { makeBackDriver
  , BackSink
  , BackSource
  }
