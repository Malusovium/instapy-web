import
  { propEq
  , path
  , F
  } from 'rambda'
import xs, { Stream } from 'xstream'

type JWT_KEY = string

type LOGIN_ACTION_DATA =
  { userName: string
  , passWord: string
  }
type LOGIN_ACTION =
  { TYPE: 'LOGIN'
  , DATA: LOGIN_ACTION_DATA
  }

type LOGIN_SUCCES =
  { TYPE: 'SUCCES'
  , SUB_TYPE: 'LOGIN'
  , DATA:
    { key: JWT_KEY
    }
  }
type LOGIN_ERROR =
  { TYPE: 'ERROR'
  , SUB_TYPE: 'LOGIN'
  , MESSAGE: string
  }

type USER_NAME = string
type PASS_WORD = string
type HASHED_PASS_WORD = string
type User =
  { userName: USER_NAME
  , passWord: PASS_WORD
  }
type HashedUser =
  { userName: USER_NAME
  , passWord: HASHED_PASS_WORD
  }

type CheckCredentials =
  (credentials: User) =>
    Promise<boolean>
type MakeCheckCredentials =
  (getUser: GetUser, checkHash: CheckHash) => CheckCredentials

type LoginProducer =
  { start: (listener:any) => void
  , stop: () => void
  }
type SetupLoginProducer =
  (checkCredentials: CheckCredentials) =>
    (loginAction$: Stream<User>) =>
      LoginProducer

const makeCheckCredentials: MakeCheckCredentials =
  (getUser, checkHash) =>
    (credentials) =>
      getUser()
        .then
         ( (storedCredentials) =>
              storedCredentials.userName !== credentials.userName ? false
              : checkHash(credentials.passWord, storedCredentials.passWord)
         )
        .catch(F)

const setupLoginProducer: SetupLoginProducer =
  (checkCredentials) =>
    (loginAction$) => {
      return (
        { start:
            (listener) => {
              loginAction$
                .addListener
                 ( { next: (credentials) =>
                       checkCredentials(credentials)
                         .then((crentialsAreCorrect) => listener.next(crentialsAreCorrect))
                   }
                 )
            }
        , stop:
            () => {
            }
        }
      )
    }

type LoginSource =
  Stream<LOGIN_SUCCES | LOGIN_ERROR>
type AuthSource =
  { login$: LoginSource
  }
type AuthSink =
  Stream<LOGIN_ACTION>

type JSON_WEB_TOKEN = string
type JSON_PAYLOAD = string | object

type CreateToken =
  (payload: JSON_PAYLOAD, options: any) =>
    Promise<JSON_WEB_TOKEN>
type CheckToken =
  (token: JSON_WEB_TOKEN, options:any) =>
    Promise<JSON_PAYLOAD>
type CreateHash =
  (passWord: PASS_WORD) =>
    Promise<HASHED_PASS_WORD>
type CheckHash =
  (passWord: PASS_WORD, passWordHash: HASHED_PASS_WORD) =>
    Promise<boolean>
type GetUser =
  () =>
    Promise<HashedUser>
type DirtyFns =
  { createToken: CreateToken
  , checkToken: CheckToken
  , createHash: CreateHash
  , checkHash: CheckHash
  , getUser: GetUser
  }

type MakeAuthDriver =
  (dirtyFns: DirtyFns) =>
    (action$: AuthSink) =>
      AuthSource
const makeAuthDriver: MakeAuthDriver =
  ( { createHash
    , checkHash
    , createToken
    , checkToken
    , getUser
    }
  ) =>
    (action$) => {
      console.log('went here')
      const loginProducer =
        setupLoginProducer
        (makeCheckCredentials(getUser, checkHash))
        ( action$
            .filter(propEq('TYPE', 'LOGIN'))
            .map(path('DATA'))
        )

      return (
        { login$: xs.create(loginProducer)
        }
      )
    }

export
  { makeAuthDriver
  , AuthSource
  , AuthSink
  }
