import * as bcrypt from 'bcrypt'

export const initBcrypt =
  ( saltRounds: number) => (
    { createHash: (password:string): Promise<string> =>
        bcrypt.hash(password, saltRounds)
    , checkHash: (password:string, hash:string): Promise<boolean> =>
        bcrypt.compare(password, hash)
    }
  )
