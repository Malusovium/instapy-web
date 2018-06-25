import * as Router from 'koa-router'
import * as koaBody from 'koa-body'
import * as jwt from 'koa-jwt'

import test from './test'
import login from './login'

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
  .post('/test', koaBody(), test.post)


export default apiRouter
