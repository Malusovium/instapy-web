import
  { equals
  , propEq
  } from 'rambda'
import xs from 'xstream'
import { protectedStream
       , splitError
       } from 'utils/stream-helpers'


const Token =
  ({ auth, message}: any) => {
    const tokenRequest =
      protectedStream
      ( 'TOKEN' )
      (message, auth.authenticated$)

    const loginSucces$ =
      auth
        .login$
        .compose(splitError)
        .out$

    const connectSucces$ =
      auth
        .connect$
        .compose(splitError)
        .out$

    const createToken$ =
      xs.merge
         ( loginSucces$
         , connectSucces$
         , tokenRequest.validated$
         )
        .mapTo<{ TYPE: 'TOKEN'}>
         ( { TYPE: 'TOKEN'
           }
         )

    const toLoggedIn$ =
      createToken$
        .mapTo
         ( { TYPE: 'AUTHENTICATED'
           , DATA: true
           }
         )

    const createdToken$ =
      auth
        .jwt$
        .compose(splitError)
        .out$
        .map
         ( (jwt:string) => (
             { TYPE: 'TOKEN'
             , DATA:
               { token: jwt
               }
             }
           )
         )

    return (
      { message: createdToken$
      , auth: xs.merge(createToken$, toLoggedIn$)
      , error$: tokenRequest.error$
      }
    )
  }

export
  { Token
  }
