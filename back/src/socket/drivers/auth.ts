import * as uuidv4 from 'uuid/v4'
import
  { propEq
  , path
  , F
  } from 'rambda'
import xs, { Stream } from 'xstream'

type LOGIN_ACTION_DATA =
  { userName: string
  , passWord: string
  }
type LOGIN_ACTION =
  { TYPE: 'LOGIN'
  , DATA: LOGIN_ACTION_DATA
  }

// type LOGIN_SUCCES =
//   { TYPE: 'SUCCES'
//   , SUB_TYPE: 'LOGIN'
//   }
// type LOGIN_ERROR =
//   { TYPE: 'ERROR'
//   , SUB_TYPE: 'LOGIN'
//   , MESSAGE: string
//   }

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

type Producer =
  { start: (listener:any) => void
  , stop: () => void
  }
type SetupLoginProducer =
  (checkCredentials: CheckCredentials) =>
    (loginAction$: Stream<User>) =>
      Producer

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
                         .then((crentialsAreCorrect) => {listener.next(crentialsAreCorrect)})
                   }
                 )
            }
        , stop:
            () => {
            }
        }
      )
    }

type JWT_ACTION =
  { TYPE: 'TOKEN'
  }

type SetupJWTProducer =
  (createToken: CreateToken, setToken: SetToken) =>
    (createJWT$: Stream<void>) =>
      Producer
const setupJWTProducer: SetupJWTProducer =
  (createToken, setToken) =>
    (createJWT$) => {
      return (
        { start:
            (listener) => {
              createJWT$
                .addListener
                 ( { next: () => {
                       const tokenID = uuidv4()
                       createToken({id: tokenID}, {})
                         .then((token: JSON_WEB_TOKEN) => {listener.next(token)})
                         .then
                          ( () => {
                              setToken
                              ( { tokenID: tokenID
                                }
                              )
                            }
                          )
                     }
                   }
                 )
            }
        , stop: () => {}
        }
      )
    }

type JWTSource =
  Stream<JSON_WEB_TOKEN>
type LOGIN_SUCCES = true
type LOGIN_ERROR = false
type LoginSource =
  Stream<LOGIN_SUCCES | LOGIN_ERROR>

type Action =
  LOGIN_ACTION
  | JWT_ACTION

type AuthSource =
  { login$: LoginSource
  , jwt$: JWTSource
  }
type AuthSink =
  Stream<Action>

type JSON_WEB_TOKEN = string
type JSON_WEB_TOKEN_ID = string
type StoredJsonWebToken =
  { tokenID: JSON_WEB_TOKEN_ID
  }
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
type GetToken =
  () => Promise<StoredJsonWebToken>
type SetToken =
  (StoredToken: StoredJsonWebToken) => Promise<void>
type GetUser =
  () =>
    Promise<HashedUser>
type DirtyFns =
  { createToken: CreateToken
  , checkToken: CheckToken
  , checkHash: CheckHash
  , getToken: GetToken
  , setToken: SetToken
  , getUser: GetUser
  }

type MakeAuthDriver =
  (dirtyFns: DirtyFns) =>
    (action$: AuthSink) =>
      AuthSource
const makeAuthDriver: MakeAuthDriver =
  ( { checkHash
    , createToken
    , checkToken
    , getToken
    , setToken
    , getUser
    }
  , tokenDuration = 8
  ) =>
    (action$) => {
      const loginProducer =
        setupLoginProducer
        (makeCheckCredentials(getUser, checkHash))
        ( action$
            .filter(propEq('TYPE', 'LOGIN'))
            .map(path('DATA'))
        )

      const jwtProducer =
        setupJWTProducer
        (createToken, setToken)
        ( action$
            .filter(propEq('TYPE', 'TOKEN'))
            .map(() => {})
        )

      return (
        { login$: xs.create(loginProducer)
        , jwt$: xs.create(jwtProducer)
        }
      )
    }

export
  { makeAuthDriver
  , AuthSource
  , AuthSink
  }
