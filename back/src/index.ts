import * as Koa from 'koa'
import * as Router from 'koa-router'
import * as serve from 'koa-static'
import * as koaBody from 'koa-body'
import * as cors from '@koa/cors'

import apiRouter from './routes'
const PORT = 3000

const app = new Koa()
const indexRouter = new Router()

indexRouter
  .use( '/api'
      , apiRouter.routes()
      , apiRouter.allowedMethods()
      )

app
  .use( cors( { origin: '*'
              }
            )
      )
  .use(serve(__dirname + '/../../front/build'))
  .use(indexRouter.routes())
  .use(indexRouter.allowedMethods())

app.listen(PORT)

console.log(`Server started on port: ${PORT}`)
