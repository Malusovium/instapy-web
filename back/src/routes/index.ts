import * as Router from 'koa-router'
import * as koaBody from 'koa-body'
import * as jwt from 'koa-jwt'

import test from './test'

const apiRouter = new Router()

const handleJWTError =
  (ctx:any, next:any) =>
    next()
      .catch( (err: any) => {
        if (401 === err.status) {
          ctx.status = 401
          ctx.body = 'Unauthorized'
        } else {
          throw err
        }
      })

apiRouter
  .use(handleJWTError)
  .use(jwt({secret: 'shared-secret'}))
  .post('/test', koaBody(), test.get)


export default apiRouter
