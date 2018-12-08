import * as uuidv4 from 'uuid/v4'
import
  { propEq
  , equals
  , path
  , F
  } from 'rambda'
import xs, { Stream, MemoryStream } from 'xstream'

type LOGIN_ACTION_DATA =
  { userName: string
  , passWord: string
  }
type LOGIN_ACTION =
  { TYPE: 'LOGIN'
  , DATA: LOGIN_ACTION_DATA
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

type CONNECT_ACTION_DATA =
  { token: JSON_WEB_TOKEN
  }
type CONNECT_ACTION =
  { TYPE: 'CONNECT'
  , DATA: CONNECT_ACTION_DATA
  }
type SetupConnectProducer =
  (checkToken: CheckToken, getToken: GetToken) =>
    (connect$: Stream<JSON_WEB_TOKEN>) =>
      Producer
const setupConnectProducer: SetupConnectProducer =
  (checkToken, getToken) =>
    (connect$) => {
      return (
        { start:
            (listener) => {
              connect$
                .debug('well??')
                .addListener
                 ( { next:
                       (token) =>
                         checkToken<JSON_PAYLOAD_DATA>(token, {})
                           .then
                            ( (payload) =>
                              getToken()
                                .then( (val) => { console.log(val); console.log(payload); return val})
                                .then
                                 ( (storedToken) =>
                                   equals(storedToken.tokenID, payload.id)
                                 )
                                .then( (validToken) => {listener.next(validToken)})
                            )
                   }
                 )
            }
        , stop: () => {}
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

type AUTHENTICATED = boolean
type AUTHENTICATED_ACTION =
  { TYPE: 'AUTHENTICATED'
  , DATA: AUTHENTICATED
  }
type SetupAuthenticatedProducer =
  (authentication$: Stream<boolean>) =>
    Producer
const setupAuthenticatedProducer: SetupAuthenticatedProducer =
  (authentication$) => {
    return (
      { start:
          (listener) => {
            authentication$
              .addListener
               ( { next: (newState: boolean) => {
                     listener.next(newState)
                   }
                 }
               )
          }
      , stop: () => {}
      }
    )
  }

type LOGIN_SUCCES = true
type LOGIN_ERROR = false
type LoginSource =
  Stream<LOGIN_SUCCES | LOGIN_ERROR>
type JWTSource =
  Stream<JSON_WEB_TOKEN>
type AuthenticatedSource =
  MemoryStream<AUTHENTICATED>

type Action =
  LOGIN_ACTION
  | JWT_ACTION
  | AUTHENTICATED_ACTION

type AuthSource =
  { login$: LoginSource
  , jwt$: JWTSource
  , authenticated$: AuthenticatedSource
  }
type AuthSink =
  Stream<Action>

type JSON_WEB_TOKEN = string
type JSON_WEB_TOKEN_ID = string
type StoredJsonWebToken =
  { tokenID: JSON_WEB_TOKEN_ID
  }
type JSON_PAYLOAD<T> = T

type JSON_PAYLOAD_DATA =
  { id: JSON_WEB_TOKEN_ID
  , iat: number
  }
type CreateToken =
  <T>(payload: JSON_PAYLOAD<T>, options: any) =>
    Promise<JSON_WEB_TOKEN>
type CheckToken =
  <T>(token: JSON_WEB_TOKEN, options:any) =>
    Promise<JSON_PAYLOAD<T>>
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

      const authenticatedProducer =
        setupAuthenticatedProducer
        ( action$
            .filter(propEq('TYPE', 'AUTHENTICATED'))
            .map(path('DATA'))
        )

      const connectProducer =
        setupConnectProducer
        (checkToken, getToken)
        ( action$
            .filter(propEq('TYPE', 'CONNECT'))
            .map(path('DATA.token'))
        )

      const authenticated$: any = //AuthenticatedSource =
        xs.create(authenticatedProducer)
          .startWith(false)

      return (
        { login$: xs.create(loginProducer)
        , jwt$: xs.create(jwtProducer)
        , authenticated$: authenticated$
        , connect$: xs.create(connectProducer)
        }
      )
    }

export
  { makeAuthDriver
  , AuthSource
  , AuthSink
  }
