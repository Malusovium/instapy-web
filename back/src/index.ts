import { createServer } from 'http'
import * as WebSocket from 'ws'
import { reduce } from 'rambda'
// import { sendStatic } from './utils/static'
// import { routes as apiRoutes } from './routes'
import { makeRouter } from 'utils/router'
import { sendStatic } from 'utils/static'
import { createSession } from './socket'
import { setupSessionHandler } from 'utils/session-handler'

const sendFrontFile =
  (fileName: string, encoding: string | null = 'utf8') => (
    { GET: sendStatic(`${__dirname}/../../front/build/${fileName}`, encoding)
    }
  )

const corsHeaders =
  { 'Access-Control-Allow-Origin': '*'
  , 'Access-Control-Allow-Credentials': true
  , 'Access-Control-Allow-Methods': 'GET, POST'
  }

const handleCorsePreflightRequest =
  (req:any, res:any) => {
    if(req.method === 'OPTIONS') {
      res.writeHead(200, corsHeaders)
    }
  }

const serveIndexHTML =
  sendFrontFile('index.html')

const frontRoutes =
  [ 'login'
  , 'logs'
  , 'bot-config'
  ]

const makeFrontRoutes =
  reduce
  ( (acc, curr: string) => ({...acc, [curr]: serveIndexHTML})
  , { 'index': serveIndexHTML
    , 'index.html': serveIndexHTML
    }
  )

const routes =
  { sub:
    // { 'api': apiRoutes
    { 'index': serveIndexHTML
    , 'index.html': serveIndexHTML
    , 'app.js': sendFrontFile('app.js')
    , 'api.js': sendFrontFile('api.js')
    , 'assets':
      { sub:
        { 'c6ec0150-background.png':
          sendFrontFile(`assets/c6ec0150-background.png`, null)
        , 'e8d20fff-instapy-web-icon-filled-white.svg':
          sendFrontFile(`assets/e8d20fff-instapy-web-icon-filled-white.svg`)
        }
      }
    , ...makeFrontRoutes(frontRoutes)
    }
  , GET: sendStatic(`${__dirname}/../../front/build/index.html`)
  }

const router =
  makeRouter(routes)

const handleRequest =
  (req: any, res: any) => {
    handleCorsePreflightRequest(req, res)

    const route = router(req)

    route(req)
      .then
       ( (mess) => {
         console.log(req.url, mess)
         if (req.url.endsWith('.png')){
           res.writeHead
               ( 200
               , { 'Content-Type': 'image/png'
                 }
               )
         }
         res.write(mess)
       })
      .catch
       ( (err) => {
           res.write(err.toString())
         }
       )
      .finally
       ( () => {
           res.end()
         }
       )
  }

const socketSessionHandler = setupSessionHandler(createSession)

const wss = new WebSocket.Server({ noServer: true})
wss.on('connection', socketSessionHandler.add)
const server = createServer(handleRequest)
server
  .on
   ( 'upgrade'
   , (request, socket, head) => {
       wss
         .handleUpgrade
          ( request
          , socket
          , head
          , (ws) => {
              wss.emit('connection', ws, request)
            }
          )
     }
   )

server.listen(8080)
