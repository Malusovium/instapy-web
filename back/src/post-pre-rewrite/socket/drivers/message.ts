import { makeWsHandler } from 'utils/ws-handler'
import { initJWT } from 'utils/jwt'
import xs from 'xstream'

import { find
       , compose
       , drop
       , split
       , join
       } from 'rambda'

const { checkToken } = initJWT('DEINIE_MUTTIE')

const extractToken =
  (headers: any) => {
    if ( headers['sec-websocket-protocol'] === undefined) {
      return ''
    } else {
      const token =
        compose
        ( join('')
        , drop(1)
        , split(':')
        , (bearerToken?: string) => bearerToken || ':'
        , find( (protocol:string) => protocol.startsWith('Bearer:') )
        , split(',')
        )(headers['sec-websocket-protocol'])

      console.log(token)

      return token
    }
  }

const createInternalData =
  (req: any) => {
    console.log(req.headers)
    return Promise
      .all
       ( [ checkToken(extractToken(req.headers))
             .catch( () => null)
         ]
       )
      .then( ([token]) => token)
  }

const wsHandler =
  makeWsHandler
  ( { toIn: (rawMessage) => rawMessage
    , toOut: (message) => message
    }
  )

const makeMessageDriver =
  (wss:any) =>
    (messageOut$:any) => {
      messageOut$
        .addListener
         ( { next:
               (internalMessage:any) => {
                 wsHandler.send(internalMessage)
               }
           }
         )
      wss.on('connection', wsHandler.add)

      const messageInProducer =
        { start: (listener:any) => {
            wsHandler
              .receive
               ( (internalMessage:any) => {
                   listener.next(internalMessage)
                 }
               )
          }
        , stop: () => {}
        }

      return xs.create(messageInProducer)
    }

export
  { makeMessageDriver
  }
