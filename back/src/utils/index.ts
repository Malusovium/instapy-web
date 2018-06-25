import { initBcrypt } from './bcrypt'
import { initJwt } from './jwt'
import { _throw, throwWhen } from './throw'
import { handleError } from './handle-error'

export { genId } from './gen-id'
export { _db } from './db'

export const auth =
  { initBcrypt
  , initJwt
  }

export const err =
  { _throw
  , throwWhen
  , handleError
  }
