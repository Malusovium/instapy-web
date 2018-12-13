import { run } from '@cycle/run'
import { makeMessageDriver } from './drivers/message'
import { makeAuthDriver } from './drivers/auth'
import { makeBotDriver } from './drivers/bot'

import { setupBcrypt } from 'utils/bcrypt'
import { setupJWT } from 'utils/jwt'
import { setupJSONStore } from 'utils/json-store'

import { Main } from './main'
// const JSONParse =
//   (jsonString: string) => {
//     try {
//       const parsedJSON = JSON.parse(jsonString)
//       return parsedJSON
//     } catch {
//       return null
//     }
//   }
//
// const isNotNil = complement(isNil)

// type Message = string | number
// const makeJSONMessage =
//   (message: Stream<Message>) => {
//     const jsonMessage$ =
//       message
//         .map(JSONParse)
//     const filteredJSONMessage$ =
//       jsonMessage$
//         .filter(isNotNil)
//         .debug('valid')
//     const error$ =
//       jsonMessage$
//         .filter(isNil)
//         .mapTo
//          ( { TYPE: 'ERROR'
//            , MESSAGE: 'Bad message'
//            }
//          )
//
//     return (
//       { message: filteredJSONMessage$
//       , error$: error$
//       }
//     )
//   }

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

const configStore =
  JSONStore
  ( 'config'
  , []
  )

const createSession =
  (ws:any, sessionID: string) => {
    const terminateSession =
      run
      ( Main
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
        , bot:
            makeBotDriver
            ( { getConfig: configStore.get
              , setConfig: configStore.set
              }
            )
        }
      )

    return terminateSession
  }

export
  { createSession
  }
