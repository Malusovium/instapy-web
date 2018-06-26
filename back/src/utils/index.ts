import { initBcrypt } from './bcrypt'
import { initJwt } from './jwt'
import { handleError } from './handle-error'
import { _throw
       , throwWhen
       , throwWhenNot
       } from './throw'

export { genId } from './gen-id'
export { _db } from './db'
export { bot } from './bot'

export const auth =
  { initBcrypt
  , initJwt
  }

export const err =
  { _throw
  , throwWhen
  , throwWhenNot
  , handleError
  }
