import { createServer as createHTTP } from 'http'
import { createServer as createHTTPS } from 'https'
import redirectHTTPS from 'redirect-https'
import * as Greenlock from 'greenlock-express'
// import * as greenlock from 'greenlock'
import * as WebSocket from 'ws'
import { reduce } from 'rambda'
import { makeRouter } from 'utils/router'
import { sendStatic } from 'utils/static'
import { createSession } from './socket'
import { setupSessionHandler } from 'utils/session-handler'

import { readdirSync } from 'fs'

const FRONT_BUILD_PATH = `${__dirname}/../../build`

const sendFrontFile =
  (fileName: string, encoding: string | null = 'utf8') => (
    { GET: sendStatic(`${FRONT_BUILD_PATH}/${fileName}`, encoding)
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

const makeFrontAssetRoutes =
  reduce
  ( (acc, curr: string) => (
      { ...acc
      , [curr]:
          sendFrontFile
          ( curr
          , curr.endsWith('.png')
              ? null
              : undefined
          )
      }
    )
  , {}
  )

  // (fileName: string) => (
  //   { [fileName]: sendFrontFile(fileName)
  //   }
  // )

const frontAssets =
  readdirSync(FRONT_BUILD_PATH)
    // .map(makeFrontAssetRoute)

const routes =
  { sub:
    { ...makeFrontRoutes(frontRoutes)
    , ...makeFrontAssetRoutes(frontAssets)
    }
  , GET: sendStatic(`${FRONT_BUILD_PATH}/index.html`)
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

let server
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
  const greenlock =
    Greenlock
      .create
       ( { email: process.env.EMAIL
         , approvedDomains: [ process.env.DOMAIN ]
         , server:
             process.env.NODE_ENV === 'production'
               ? 'https://acme-v02.api.letsencrypt.org/directory'
               : 'https://acme-v02.api.letsencrypt.org/directory'
         , version: 'draft-11'
         , agreeTos: true
         , configDir: `${__dirname}/../../../data`
         , communityMember: false
         , securityUpdates: false
         , app: handleRequest
         }
       )

  server = greenlock.listen(80, 443)

  // const server80 = createHTTP(gLock.middleware(redirectHTTPS))
  //
  // server = createHTTPS(gLock.tlsOptions, handleRequest)

} else {
  server = createHTTP(handleRequest)
  server.listen(9999)
}

server
  .on
   ( 'upgrade'
   , (request: any, socket:any, head:any) => {
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

// // server.listen(9999)
