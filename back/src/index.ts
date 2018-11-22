import { createServer } from 'http'
// import { sendStatic } from './utils/static'
import { routes as apiRoutes } from './routes'
import { makeRouter } from 'utils/router'
import { sendStatic } from 'utils/static'

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

const declaredRoutes =
  { '/':
    { 'GET':
        async (req:any) => {
          const result = 'this'
          return 'Well well well'
        }
    }
  , '/*':
    { 'GET':
        async (req:any) => 'Error 404 resource not found'
    }
  }

// const router =
//   (routes: any) =>
//     async (req:any) => {
//       if ( routes !== undefined && typeof routes['/*'] === 'function') {
//         if ( routes[req.url] !== undefined
//              && typeof routes[req.url][req.method] === 'function'
//            ) {
//           return routes[req.url][req.method](req)
//         } else {
//           return routes['/*'](req)
//         }
//       } else {
//         return Promise.resolve('No route found.')
//       }
//     }
//
// const staticRouter =
//   (files: any, exceptPath: string) =>
//     async (req:any) => {
//       if ( files !== undefined && typeof files['/*'] === 'string' ) {
//         if (!req.url.startsWith(exceptPath)) {
//           if ( typeof files[req.url] === 'string') {
//             return sendStatic(files[req.url])
//           } else {
//             return Promise.reject('No Static files found')
//           }
//         } else {
//           return Promise.reject('Url is exception path')
//         }
//       } else {
//         return Promise.reject('No files specified')
//       }
//     }

// const fileList =
//   { '/': './index.html'
//   , '/*': './index.html'
//   }

// const routeApi = apiRouter(declaredRoutes, '/api')
const routes =
  { sub:
    { 'api': apiRoutes
    }
  , GET: sendStatic(`${__dirname}/../../front/build/index.html`)
  }

const router =
  makeRouter(routes)

console.log(__dirname)

const handleRequest =
  (req: any, res: any) => {
    handleCorsePreflightRequest(req, res)

    const route = router(req)
      // (declaredRoutes)
      // (req)

    route(req)
      .then
       ( (mess) => {
         console.log(mess)
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
      // .then
      //  ( (message: string) => {
      //      res.write(message)
      //      res.end()
      //    }
      //  )
    // const path = Url.parse(req.pathg)
    console.log(req.url)

    // console.log(req.headers)
    // console.log(req)
    // res.write(message)
    // res.end()
  }

const server = createServer(handleRequest)

server.listen(8080)
