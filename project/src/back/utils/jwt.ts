import * as jwt from 'jsonwebtoken'

type Create =
  <T>(payload: T & Buffer, options:any) => Promise<string>

type Check =
  <T>(token: string, options:any) => Promise<any>

type SetupJWT =
  ( secret: string
  , algorithm?: string
  ) =>
    { create: Create
    , check: Check
    }
const setupJWT: SetupJWT =
  ( secret
  , algorithm = 'HS512'
  ) => (
  { create:
      async (payload, options = {}) =>
        jwt.sign( payload
                , secret
                , { ...options, algorithm }
                )
  , check:
      async (token, options = {}) =>
        jwt.verify( token
                  , secret
                  , { ...options, algorithms: [algorithm] }
                  )
  }
)

export
  { setupJWT
  }
