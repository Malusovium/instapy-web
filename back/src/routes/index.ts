import * as Router from 'koa-router'
import * as koaBody from 'koa-body'
import * as jwt from 'koa-jwt'

import test from './test'
import login from './login'
import startBot from './bot-start'
import stopBot from './bot-stop'
import statusBot from './bot-status'

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

apiRouter
  .post('/login', koaBody(), login.post)
  .use(handleJWTError)
  .use(jwt({secret: process.env.JWT_TOKEN || 'secret' }))
  .get('/bot-start', koaBody(), startBot.get)
  .get('/bot-stop', koaBody(), stopBot.get)
  .get('/bot-status', koaBody(), statusBot.get)
  .get('/test', koaBody(), test.get)

export default apiRouter
