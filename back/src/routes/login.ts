import { auth
       , _db
       , genId
       , err
       } from '../utils'

const { initBcrypt, initJwt } = auth

const { checkHash } = initBcrypt(10)
const { createToken } = initJwt(process.env.JWT_SECRET || 'secret')

const expireAt =
  (date:number, seconds:number): number =>
    Math.floor(date / 1000) + seconds

const credentialsIncorrect
  : (val:any) => any =
  err.throwWhen( 'Login credentials are incorrect!'
               , false
               )

const checkUserName =
  (userName:string): Promise<boolean> =>
    _db
      .then( (db:any) =>
        userName === db.get('userName').value()
      ).then(credentialsIncorrect)

const checkPassWord =
  (passWord:string): Promise<boolean> =>
    _db
      .then( (db:any) =>
        checkHash(passWord, db.get('passWord').value())
      ).then(credentialsIncorrect)

const checkCredentials =
  (userName:string, passWord:string) =>
    Promise.all(
      [ checkUserName(userName)
      , checkPassWord(passWord)
      ]
    )

const generateJwtKey =
  (): string => genId()

const storeJwtKey =
  (key:string): Promise<string> =>
    _db
      .then( (db:any) =>
        db.set('jwtKey', key)
          .write()
      ).then(() => key)

const expireIn =
  ( { days = 0
    , hours = 0
    , minutes = 0
    , seconds = 0
    }
  ) => {
    const daysInSeconds = days * 24 * 60 * 60
    const hoursInSeconds = hours * 60 * 60
    const minutesInSeconds = minutes * 60
    const secondsInSeconds = seconds * 1

    const totalSeconds =
      daysInSeconds
      + hoursInSeconds
      + minutesInSeconds
      + secondsInSeconds

    return expireAt(Date.now(), totalSeconds)
  }

const generateJwtToken =
  (uid:string): Promise<string> =>
    createToken( { exp: expireIn({days: 1})
                 , uid
                 }
               )

const login =
  async (ctx:any) => {
    const { userName, passWord } = ctx.request.body.data

    await checkCredentials(userName, passWord)
      .then( generateJwtKey )
      .then( storeJwtKey )
      .then( generateJwtToken )
      .then( (token:string) =>
        ctx.body = { token }
      ).catch( err.handleError(ctx) )
  }

export default { post: login }

