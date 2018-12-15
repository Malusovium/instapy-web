import xs from 'xstream'

import { find
       , compose
       , drop
       , split
       , join
       } from 'rambda'

const makeMessageDriver =
  (ws:any) =>
    (messageOut$:any) => {
      messageOut$
        .addListener
         ( { next:
               (internalMessage:any) => {
                 ws.send(internalMessage)
               }
           }
         )

      const messageInProducer =
        { start: (listener:any) => {
            ws.on
               ( 'message'
               , (incommingMessage: string) => { listener.next(incommingMessage) }
               )
          }
        , stop: () => {}
        }

      return xs.create(messageInProducer)
    }

export
  { makeMessageDriver
  }
