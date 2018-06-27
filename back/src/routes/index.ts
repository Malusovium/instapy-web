import * as Router from 'koa-router'
import * as koaBody from 'koa-body'
import * as jwt from 'koa-jwt'

import { _db } from '../utils'

import test from './test'
import login from './login'
import logout from './logout'
import startBot from './bot-start'
import stopBot from './bot-stop'
import statusBot from './bot-status'
import botConfig from './bot-config'

const apiRouter = new Router()

const handleJWTError =
  (ctx:any, next:any) =>
    next()
      .catch( (err: any) => {
        if (401 === err.status) {
          ctx.status = 401
          ctx.body =
            { error: 'Unauthorized' }
        } else {
          throw err
        }
      })

// const logit = (val:any) => { console.log(val); return val }

const revokeJwtKey =
  async (ctx:any, decoded:any, token:string): Promise<boolean> =>
    _db
      .then( (db:any) =>
        db.get('jwtKey')
          .value()
      ).then( (storedJwtKey:string) =>
        storedJwtKey !== decoded.uid
      )

apiRouter
  .post('/login', koaBody(), login.post)
  .use(handleJWTError)
  .use(jwt( { secret: process.env.JWT_TOKEN || 'secret'
            , isRevoked: revokeJwtKey
            }
          )
      )
  .get('/logout', koaBody(), logout.get)
  .get('/bot-start', koaBody(), startBot.get)
  .get('/bot-stop', koaBody(), stopBot.get)
  .get('/bot-status', koaBody(), statusBot.get)
  .get('/bot-config', koaBody(), botConfig.get)
  .post('/bot-config', koaBody(), botConfig.post)
  .get('/test', koaBody(), test.get)

export default apiRouter
