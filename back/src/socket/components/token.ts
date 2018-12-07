import { equals } from 'rambda'
import xs from 'xstream'

const Token =
  ({ auth, message}: any) => {
    const loginSucces$ =
      auth
        .login$
        .filter(equals(true))

    const createToken$ =
      xs.merge(loginSucces$)
        .mapTo<{ TYPE: 'TOKEN'}>
         ( { TYPE: 'TOKEN'
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

    return (
      { message: createdToken$
      , auth: createToken$
      }
    )
  }

export
  { Token
  }
