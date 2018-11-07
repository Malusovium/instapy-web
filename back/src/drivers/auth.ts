import xs, { Stream } from 'xstream'
import { InternalSelf } from './types'
import { onlyAction } from './../utils/message-helpers'

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

type ActionType = LOGIN | RECONNECT

type Action =
  LOGIN_ACTION | RECONNECT_ACTION

type JWT_TOKEN =
  { TYPE: 'JWT_TOKEN'
  , DATA:
    { token: string
    }
  } & InternalSelf

type Login =
  (action$: Stream<Action>) => Stream<JWT_TOKEN>
const login: Login =
  (action$) => {
    const login$ =
      onlyAction
      ('LOGIN')
      (action$)
    const loginProducer =
      { start: (listener:any) => {
          login$
            .addListener
             ( { next: ({_self, DATA}) => {
                   if(DATA.userName === 'HENK' && DATA.passWord === 'PASS') {
                     console.log('triggered')
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
      , stop: () => {}
      }

    return xs.create(loginProducer)
  }

type AuthSource =
  { jwt$: Stream<JWT_TOKEN>
  }
type AuthSink = Stream<Action>

type MakeAuthDriver =
  () =>
    (action$: AuthSink) =>
      AuthSource

const makeAuthDriver: MakeAuthDriver =
  () =>
    (action$) => {
      const login$ = login(action$)
      // const reconnect$ =
      //   actions$
      //     .filter(isType('RECONNECT'))

      return (
        { jwt$: xs.merge(login$)
        }
      )
    }
export
  { AuthSource
  , AuthSink
  , makeAuthDriver
  }
