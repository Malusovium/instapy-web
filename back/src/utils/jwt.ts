import * as jwt from 'jsonwebtoken'

const setupJWT =
  ( secret:string
  , algorithm = 'HS512'
  ) => (
  { create:
      async (payload:any, options:any = {}) =>
        jwt.sign( payload
                , secret
                , { ...options, algorithm }
                )
  , check:
      async (token:any, options:any = {}) =>
        jwt.verify( token
                  , secret
                  , { ...options, algorithms: [algorithm] }
                  )
  }
)

export
  { setupJWT
  }
