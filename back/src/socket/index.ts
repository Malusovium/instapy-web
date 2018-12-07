import { run } from '@cycle/run'
import { makeMessageDriver
       } from './drivers/message'
import
  { AuthSource
  , AuthSink
  , makeAuthDriver
  } from './drivers/auth'
import delay from 'xstream/extra/delay'
import xs, { Stream } from 'xstream'

import { setupBcrypt } from 'utils/bcrypt'
import { setupJWT } from 'utils/jwt'
import { setupJSONStore } from 'utils/json-store'

import
  { compose
  , isNil
  , complement
  } from 'rambda'

import { Login } from './components/login'
import { Token } from './components/token'

type Sources =
  { message: any//MessageSource
  , auth: AuthSource
  }
type Sinks =
  { message?: any//MessageSink
  , auth?: AuthSink
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
  (message: Stream<Message>) => {
    const jsonMessage$ =
      message
        .map(JSONParse)
    const filteredJSONMessage$ =
      jsonMessage$
        .filter(isNotNil)
        .debug('valid')
    const error$ =
      jsonMessage$
        .filter(isNil)
        .mapTo
         ( { TYPE: 'ERROR'
           , MESSAGE: 'Bad message'
           }
         )

    return (
      { message: filteredJSONMessage$
      , error$: error$
      }
    )
  }

const main: Component =
  ({ message, auth }) => {
    const JSONMessage = makeJSONMessage(message)
    const login =
      Login
      ( { message: JSONMessage.message
        , auth
        }
      )

    const token =
      Token
      ( { message: JSONMessage.message
        , auth
        }
      )

    const messageOut$ =
      xs.merge
         ( JSONMessage.error$
         , token.message
         , login.message
         , login.error$
         )
        .map(JSON.stringify)

    const auth$: any =
      xs.merge
         ( login.auth
         , token.auth
         )

    return (
      { message: messageOut$
      , auth: auth$
      }
    )
  }

const bcrypt = setupBcrypt(2)
const jwt = setupJWT('MY_SECRET')
const JSONStore = setupJSONStore(`${__dirname}/../../../data`)

const userStore =
  JSONStore
  ( 'user'
  , { userName: 'henkie'
    , passWord: bcrypt.createSync('password')
    }
  )

const tokenStore =
  JSONStore
  ( 'token'
  , { tokenID: 'no token'
    }
  )

const createSession =
  (ws:any, sessionID: string) => {
    const terminateSession =
      run
      ( main
      , { message: makeMessageDriver(ws)
        , auth:
            makeAuthDriver
            ( { checkHash: bcrypt.check
              , createToken: jwt.create
              , checkToken: jwt.check
              , getUser: userStore.get
              , getToken: tokenStore.get
              , setToken: tokenStore.set
              }
            )
        }
      )

    return terminateSession
  }

export
  { createSession
  }
