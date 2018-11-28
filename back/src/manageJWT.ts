import { initJWT } from 'utils/jwt'

const { checkToken
      , createToken
      } = initJWT(`Deine muttie`)

export
  { checkToken
  , createToken
  }
