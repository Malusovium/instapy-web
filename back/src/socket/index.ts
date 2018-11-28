import { run } from '@cycle/run'
import { makeMessageDriver
       // , InternalMessage
       // , MessageSink
       // , MessageSource
       } from './drivers/message'
import delay from 'xstream/extra/delay'
import xs, { Stream } from 'xstream'

type Sources =
  { message: any//MessageSource
  }
type Sinks =
  { message?: any//MessageSink
  }

type Component =
  (sources: Sources) => Sinks

const TOKEN =
  { TYPE: 'TOKEN'
  , _to: 'All'
  , DATA: { key: 'my-key' }
  }

const ROUND_ROBIN =
  { TYPE: 'ROUND_ROBIN'
  , _to: 'All'
  , DATA:
    { timeStamp: 'right meow' }
  }

const main: Component =
  ({ message }) => {
    const roundTrip$ = message
      .debug('well?')
      // .map<InternalMessage>( ({_self}) => ({_self: {..._self, _to: 'SELF'}, TYPE: 'HENK!'}))

    return (
      { message: xs.merge(roundTrip$)
      }
    )
  }

const makeSocket =
  (wss:any) => {
    run
    ( main
    , { message: makeMessageDriver(wss)
      }
    )

    return (request:any, socket:any, head:any) => {
      wss
        .handleUpgrade
         ( request
         , socket
         , head
         , (ws:any) => {
             wss.emit('connection', ws, request)
           }
         )
    }
  }

export
  { makeSocket
  }
