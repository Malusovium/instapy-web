import { run } from '@cycle/run'
import { makeMessageDriver
       // , InternalMessage
       // , MessageSink
       // , MessageSource
       } from './drivers/message'
import { makeAuthDriver } from './drivers/auth'
import delay from 'xstream/extra/delay'
import xs, { Stream } from 'xstream'

import { setupSessionHandler } from './session-handler'

import
  { compose
  , isNil
  , complement
  } from 'rambda'

import { Login } from './components/login'

type Sources =
  { message$: any//MessageSource
  , auth$: any
  }
type Sinks =
  { message$?: any//MessageSink
  , auth$?: any
  }

type Component =
  (sources: Sources) => Sinks

const JSONParse =
  (jsonString: string) => {
    try {
      const parsedJSON = JSON.parse(jsonString)
      return parsedJSON
    } catch {
      return null
    }
  }

const isNotNil = complement(isNil)

type Message = string | number
const makeJSONMessage =
  (message$: Stream<Message>) => {
    const jsonMessage$ =
      message$
        .map(JSONParse)
    const filteredJSONMessage$ =
      jsonMessage$
        .filter(isNotNil)
    const error$ =
      jsonMessage$
        .filter(isNil)
        .mapTo(`Bad message`)

    return (
      { message$
      , error$
      }
    )
  }

const main: Component =
  ({ message$, auth$ }) => {
    const JSONMessage = makeJSONMessage(message$)
    const roundTrip$ = message$
      .debug('well?')
    const login =
      Login
      ( { message$: JSONMessage.message$
        , auth$
        }
      )

    return (
      { message$:
          xs.merge
             ( roundTrip$
             , login.message$
             , JSONMessage.error$
             )
      , auth$: xs.merge(login.auth$)
      }
    )
  }

const createSession =
  (ws:any, sessionID: string) => {
    const terminateSession =
      run
      ( main
      , { message$: makeMessageDriver(ws)
        , auth$: makeAuthDriver()
        }
      )

    return terminateSession
  }

export
  { createSession
  , setupSessionHandler
  }
