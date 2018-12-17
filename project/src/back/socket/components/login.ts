import { has
       , propEq
       , equals
       } from 'rambda'

import
  { splitError
  } from 'utils/stream-helpers'

type Action =
  { TYPE: string
  , DATA?: any
  }
type isOfType =
  (typeSelector: string) =>
    (action: Action) => boolean

const isOfType: isOfType =
  (typeSelector) =>
    ({ TYPE }) => TYPE === typeSelector

const Login =
  ({ message, auth }: any) => {
    const loginRequest$ =
      message
        .filter(propEq('TYPE', 'LOGIN'))
        .filter(has('DATA'))

    const forkLogin =
      auth
        .login$
        .compose(splitError)

    const loginSucces$ =
      forkLogin
        .out$
        .mapTo
         ( { TYPE: 'SUCCES'
           , SUB_TYPE: 'LOGIN'
           }
         )

    const loginError$ =
      forkLogin
        .error$
        .debug('Error reason')
        .mapTo
         ( { TYPE: 'ERROR'
           , SUB_TYPE: 'LOGIN'
           , MESSAGE: 'Bad Credentials'
           }
         )

    return (
      { auth: loginRequest$
      , message: loginSucces$
      , error$: loginError$
      }
    )
  }

export
  { Login
  }
