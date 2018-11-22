import * as Koa from 'koa'
import * as Router from 'koa-router'
import * as serve from 'koa-static'
import * as send from 'koa-send'
import * as koaBody from 'koa-body'
import * as cors from '@koa/cors'

import apiRouter from './routes'
const PORT = 3000

const app = new Koa()
const indexRouter = new Router()

const sendIndex =
  async (ctx: any) =>
    await send
          ( ctx
          , '/front/build/index.html'
          , { root: __dirname + '/../..' }
          )

indexRouter
  .redirect('/', '/login')
  .get( '/login', sendIndex)
  .get( '/bot', sendIndex)
  .get( '/config', sendIndex)
  .get( '/logs', sendIndex)
  .use( '/api'
      , apiRouter.routes()
      , apiRouter.allowedMethods()
      )

app
  .use( cors({ origin: '*' }) )
  .use(indexRouter.routes())
  .use(indexRouter.allowedMethods())
  .use(serve(__dirname + '/../../front/build'))

app.listen(PORT)

console.log(`Server started on port: ${PORT}`)
