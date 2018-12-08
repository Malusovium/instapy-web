import
  { equals
  , propEq
  } from 'rambda'
import xs from 'xstream'
import { protectedStream } from 'utils/stream-helpers'


const Token =
  ({ auth, message}: any) => {
    const tokenRequest =
      protectedStream
      ( 'TOKEN' )
      (message, auth.authenticated$)
      // message
      //   .filter(propEq('TYPE', 'TOKEN'))
    // const securedTokenRequest =
    //   activateWhen
    //   ( equals(true) )
    //   (tokenRequest$, auth.authenticated$)

    const loginSucces$ =
      auth
        .login$
        .filter(equals(true))

    const connectSucces$ =
      auth
        .connect$
        .filter(equals(true))

    const createToken$ =
      xs.merge
         ( loginSucces$ //.debug('triggerd login')
         , connectSucces$ //.debug('triggerd connect')
         , tokenRequest.validated$
         )
        // .debug('create token:')
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
        .map
         ( (jwt:string) => (
             { TYPE: 'TOKEN'
             , DATA:
               { token: jwt
               }
             }
           )
         )

    // const securedTokenRequestInvalid$ =
    //   securedTokenRequest
    //     .error$
    //     .mapTo
    //      ( { TYPE: 'ERROR'
    //        , SUB_TYPE: 'TOKEN'
    //        , MESSAGE: 'Not logged in!'
    //        }
    //      )

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
