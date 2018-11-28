import * as jwt from 'jsonwebtoken'

const initJWT =
  ( secret:string
  , algorithm = 'HS512'
  ) => (
  { createToken:
      async (payload:any, options:any = {}) =>
        jwt.sign( payload
                , secret
                , { ...options, algorithm }
                )
  , checkToken:
      async (token:any, options:any = {}) =>
        jwt.verify( token
                  , secret
                  , { ...options, algorithms: [algorithm] }
                  )
  }
)

export
  { initJWT
  }
