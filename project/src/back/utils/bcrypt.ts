import * as bcrypt from 'bcrypt'

export const setupBcrypt =
  (saltRounds: number = 4) => {
    // const salt = bcrypt.genSaltSync(saltRounds)

    return (
      { create: (passWord: string): Promise<string> =>
          bcrypt.hash(passWord, saltRounds)
      , check: (passWord: string, hash: string): Promise<boolean> =>
          bcrypt.compare(passWord, hash)
      , createSync: (passWord: string) =>
          bcrypt.hashSync(passWord, saltRounds)
      }
    )
  }
