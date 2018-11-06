import { run } from '@cycle/run'
import { makeMessageDriver
       , InternalMessage
       , MessageDriverSinks
       , MessageDriverSources
       } from './drivers/message'

import delay from 'xstream/extra/delay'
import xs, { Stream } from 'xstream'

type Sources =
  { message: MessageDriverSinks
  }
type Sinks =
  { message?: MessageDriverSources
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
  (sources) => {
    const roundTrip$ = sources.message.all$
      .map<InternalMessage>( ({_self}) => ({_self: {..._self, _to: 'SELF'}, TYPE: 'HENK!'}))
      .debug('well?')
    // const token$ =
    //   xs.of(TOKEN)
    //     .compose(delay(10000))

    return (
      { message: xs.merge(roundTrip$)
      }
    )
  }

run(main, {message: makeMessageDriver(8080) })
