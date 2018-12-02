import * as jwt from 'jsonwebtoken'

export const initJwt =
  ( secret:string
  , algorithm = 'HS512'
  ) => (
  { createToken: (payload:any, options:any = {}) =>
      Promise.resolve()
        .then( () =>
          jwt.sign( payload
                  , secret
                  , { ...options, algorithm }
                  )
        )
  , checkToken: (token:any, options:any = {}) =>
      Promise.resolve()
        .then( () =>
          jwt.verify( token
                    , secret
                    , { ...options, algorithms: [algorithm] }
                    )
        )
  }
)
