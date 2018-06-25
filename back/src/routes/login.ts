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

const generateJwtUid =
  (): string => genId()

const generateJwtToken =
  (uid:string): Promise<string> =>
    createToken( { exp: expireAt(Date.now(), 60 * 60)
                 , uid
                 }
               )

const login =
  async (ctx:any) => {
    const { userName, passWord } = ctx.request.body.data

    await checkCredentials(userName, passWord)
      .then( generateJwtUid )
      .then( generateJwtToken )
      .then( (token:string) =>
        ctx.body = { token }
      ).catch( err.handleError(ctx) )
  }

export default { post: login }

