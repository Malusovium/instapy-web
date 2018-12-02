import xs, { Stream } from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine'
import { InternalSelf } from './types'
import { onlyAction } from './../utils/message-helpers'
import { jsonStore } from './../utils/store'

const DATA_PATH: string =
  process.env.DATA_PATH
    ? process.env.DATA_PATH
    : './../../../data'

const PERSIST_DB: boolean =
  process.env.PERSIST === 'true'
    ? true
    : false

type UserName = string
type PassWord = string
type HashedPassWord = string

type HashedUser =
  { userName: UserName
  , passWord: HashedPassWord
  }
const userStore =
  jsonStore
  (DATA_PATH, PERSIST_DB)
  <HashedUser>('user', { userName: 'admin', passWord: 'pass'})
const userProducer =
  { start: (listener:any) => {
      userStore.get()
        .then( (firstUser) => { listener.next(firstUser) })
      userStore
        .watch
         ( (updatedUser) => {
             listener.next(updatedUser)
           }
         )
    }
  , stop: () => {
      userStore.ignore()
    }
  }

type LOGIN = 'LOGIN'
type RECONNECT = 'RECONNECT'

type LOGIN_ACTION =
  { TYPE: LOGIN
  , DATA:
    { userName: string
    , passWord: string
    }
  } & InternalSelf

type RECONNECT_ACTION =
  { TYPE: RECONNECT
  , DATA:
    { token: string
    }
  } & InternalSelf

type LOGIN_ERROR =
  { TYPE: 'ERROR'
  , DATA:
    { REQUEST_TYPE: 'LOGIN'
    , MESSAGE: string
    }
  } & InternalSelf

type ActionType =
  LOGIN
  | RECONNECT

type Action =
  LOGIN_ACTION
  | RECONNECT_ACTION

type JWT_TOKEN =
  { TYPE: 'JWT_TOKEN'
  , DATA:
    { token: string
    }
  } & InternalSelf

type LoginStart =
  (login$: Stream<LOGIN_ACTION>) =>
    (listener: any) => void
const loginStart: LoginStart =
  (login$) =>
    (listener) => {
      const storedUser$: Stream<HashedUser> =
        xs.create(userProducer)
      login$
        .compose( sampleCombine(storedUser$) )
        .addListener
         ( { next:
               ([{_self, DATA}, storedUser]) => {
                 if ( DATA.userName === storedUser.userName
                      && DATA.passWord === storedUser.passWord
                    ) {
                   listener
                     .next
                      ( { _self
                        , TYPE: 'JWT_TOKEN'
                        , DATA:
                          { token: 'jwt-key'
                          }
                        }
                      )
                 } else {
                   listener
                     .next
                      ( { _self:
                          { ..._self
                          , _show: true
                          }
                        , TYPE: 'ERROR'
                        , DATA:
                          { REQUEST_TYPE: 'LOGIN'
                          , MESSAGE: 'Wrong user credentials'
                          }
                        }
                      )
                 }
               }
           }
         )
    }

type Login =
  (action$: Stream<Action>) => (
    { jwt$: Stream<JWT_TOKEN>
    , error$: Stream<LOGIN_ERROR>
    }
  )
const login: Login =
  (action$) => {
    const login$ =
      onlyAction
      ('LOGIN')
      (action$)
    const loginProducer =
      { start: loginStart(login$)
      , stop: () => {}
      }

    const outLogin$ = xs.create(loginProducer)

    return (
      { error$: onlyAction ('ERROR') (outLogin$)
      , jwt$: onlyAction ('JWT_TOKEN') (outLogin$)
      }
    )
  }

type AuthSource =
  { jwt$: Stream<JWT_TOKEN>
  , error$: Stream<LOGIN_ERROR>
  }
type AuthSink = Stream<Action>

type MakeAuthDriver =
  () =>
    (action$: AuthSink) =>
      AuthSource

const makeAuthDriver: MakeAuthDriver =
  () =>
    (action$) => {
      const loginJWT = login(action$)

      return (
        { jwt$: xs.merge(loginJWT.jwt$)
        , error$: xs.merge(loginJWT.error$)
        }
      )
    }
export
  { AuthSource
  , AuthSink
  , makeAuthDriver
  }
