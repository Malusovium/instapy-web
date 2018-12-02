import { run } from '@cycle/run'
import { makeMessageDriver
       , InternalMessage
       , MessageSink
       , MessageSource
       } from './drivers/message'
import { AuthSource
       , AuthSink
       , makeAuthDriver
       } from './drivers/auth'

import delay from 'xstream/extra/delay'
import xs, { Stream } from 'xstream'

type Sources =
  { message: MessageSource
  , auth: AuthSource
  }
type Sinks =
  { message?: MessageSink
  , auth?: AuthSink
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
  ({ message, auth }) => {
    const roundTrip$ = message.all$
      .debug('well?')
      .map<InternalMessage>( ({_self}) => ({_self: {..._self, _to: 'SELF'}, TYPE: 'HENK!'}))

    return (
      { message: xs.merge(roundTrip$, auth.jwt$, auth.error$)
      , auth: xs.merge(message.pick('LOGIN'))
      }
    )
  }

run
( main
, { message: makeMessageDriver(8080)
  , auth: makeAuthDriver()
  }
)
