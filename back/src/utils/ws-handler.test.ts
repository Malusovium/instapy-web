import * as WebSocket from 'ws'
import { makeWsHandler } from './ws-handler'

const createInternalData = async () => null

const wsHandler = makeWsHandler<null>(createInternalData)

const wss = new WebSocket.Server({port: 9999})

wss.on('connection', wsHandler.add)

// Test 1
// setTimeout
// ( () => {
//     wsHandler
//     .receive((internalMessage) => {console.log(`Received Message: `, internalMessage)})
//   }
// , 1000
// )

// Test 2
setTimeout
( () => {
    wsHandler
      .receive
       ( ({connectionID, message}) => {
           wsHandler
             .send
              ( { connectionID: connectionID
                , internal: null
                , message: message
                }
              )
         }
       )
  }
, 1000
)

// Test 3
// setTimeout
// ( () => {
//     wsHandler
//       .receive
//        ( ({connectionID}) => {
//            wsHandler
//              .send
//               ( { connectionID: connectionID
//                 , internal: null
//                 , message: 'JE MOEDER!'
//                 }
//               )
//            wsHandler.remove(connectionID)
//          }
//        )
//   }
// , 1000
// )
