import delay from 'xstream/extra/delay'
import xs, { Stream } from 'xstream'

import
  { nestStream
  , nestOp
  , splitError
  } from 'utils/stream-helpers'
import
  { compose
  , path
  , isNil
  , complement
  } from 'rambda'

import
  { AuthSource
  , AuthSink
  } from './drivers/auth'
import
  { BotSource
  , BotSink
  } from './drivers/bot'

import { Login } from './components/login'
import { Token } from './components/token'
import { Connect } from './components/connect'
import { Start } from './components/start'
import { Status } from './components/status'
import { Logs } from './components/logs'
import { Build } from './components/build'

type Sources =
  { message: any//MessageSource
  , auth: AuthSource
  , bot: BotSource
  }
type Sinks =
  { message?: any//MessageSink
  , auth?: AuthSink
  , bot?: BotSink
  }

type Component =
  (sources: Sources) => Sinks

const Main: Component =
  ({ message, auth, bot }) => {
    const tryJSONParse =
      message
        .compose(nestStream)
        .compose(nestOp(JSON.parse))
        .compose(splitError)

    const JSONMessage$ =
      tryJSONParse
        .out$
        .debug('Correctly parsed JSON')

    const errorJSONParse$ =
      tryJSONParse
        .error$
        .debug('error happend during parsing')

    const login =
      Login
      ( { message: JSONMessage$
        , auth
        }
      )

    const token =
      Token
      ( { message: JSONMessage$
        , auth
        }
      )

    const connect =
      Connect
      ( { message: JSONMessage$
        , auth
        }
      )

    const start =
      Start
      ( { message: JSONMessage$
        , auth
        , bot
        }
      )

    const status =
      Status
      ( { message: JSONMessage$
        , auth
        , bot
        }
      )

    const logs =
      Logs
      ( { message: JSONMessage$
        , auth
        , bot
        }
      )

    const build =
      Build
      ( { message: JSONMessage$
        , auth
        }
      )

    const messageOut$ =
      xs.merge
         ( errorJSONParse$
         , connect.message
         , connect.error$
         , token.message
         , token.error$
         , login.message
         , login.error$
         , start.error$
         , status.message
         , status.error$
         , logs.message
             // .debug('log')
         , logs.error$
         , build.error$
         )
        .map(JSON.stringify)

    const auth$: any =
      xs.merge
         ( login.auth
         , token.auth
         , connect.auth
         )

    const bot$: any =
      xs.merge
         ( start.bot
         , status.bot
         , logs.bot
         , build.bot
         )

    return (
      { message: messageOut$
      , auth: auth$
      , bot: bot$
      }
    )
  }

export
  { Main
  }
