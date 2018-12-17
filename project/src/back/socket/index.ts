import { run } from '@cycle/run'
import { makeMessageDriver } from './drivers/message'
import { makeAuthDriver } from './drivers/auth'
import { makeBotDriver } from './drivers/bot'

import { setupBcrypt } from 'utils/bcrypt'
import { setupJWT } from 'utils/jwt'
import { setupJSONStore } from 'utils/json-store'

import { Main } from './main'

const DATA_PATH =
  process.env.DATA_PATH
  || `${__dirname}/../../../../data`

const isProduction =
  process.env.PRODUCTION
    ? true
    : false

const bcrypt = setupBcrypt(isProduction ? 20 : 2)
const jwt = setupJWT('MY_SECRET')
const JSONStore = setupJSONStore(DATA_PATH)

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
