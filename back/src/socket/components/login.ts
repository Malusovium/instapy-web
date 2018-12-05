import { has
       , propEq
       , equals
       } from 'rambda'

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
  ({ message$, auth }: any) => {
    const loginRequest$ =
      message$
        .filter(propEq('TYPE', 'LOGIN'))
        .filter(has('DATA'))
        .debug('came here')

    const loginSucces$ =
      auth.login$
        .filter(equals(true))
        .mapTo
         ( { TYPE: 'SUCCES'
           , SUB_TYPE: 'LOGIN'
           }
         )
        // .mapTo('the key')
        // .map
        //  ( (key:string) => (
        //      { TYPE: 'SUCCESS'
        //      , SUB_TYPE: 'LOGIN'
        //      , DATA:
        //        { key: key
        //        }
        //      }
        //    )
        //  )

    const loginError$ =
      auth.login$
        .filter(equals(false))
        .mapTo
         ( { TYPE: 'ERROR'
           , SUB_TYPE: 'LOGIN'
           , MESSAGE: 'Bad Credentials'
           }
         )
         // ( (message: string) => (
         //     { TYPE: 'ERROR'
         //     , SUB_TYPE: 'LOGIN'
         //     , MESSAGE: 'Bad Credentials'
         //     }
         //   )
         // )

    // const loginSucces$ =
    //   auth.login.succes$
    //     .map
    //      ( (key:string) => (
    //          { TYPE: 'SUCCESS'
    //          , SUB_TYPE: 'LOGIN'
    //          , DATA:
    //            { key: key
    //            }
    //          }
    //        )
    //      )
    //
    // const loginError$ =
    //   auth.login.error$
    //     .map
    //      ( (message: string) => (
    //          { TYPE: 'ERROR'
    //          , SUB_TYPE: 'LOGIN'
    //          , MESSAGE: message
    //          }
    //        )
    //      )
    //

    return (
      { auth: loginRequest$
      , message$: loginSucces$
      , error$: loginError$
      }
    )
  }

export
  { Login
  }
