import xs from 'xstream'
import dropRepeats from 'xstream/extra/dropRepeats'
import
  { protectedStream
  , splitError
  } from 'utils/stream-helpers'

const Status =
  ({ bot, auth, message }:any) => {
    const startRequest =
      protectedStream
      ('SUBSCRIBE_STATUS')
      (message, auth.authenticated$)

    const startStatus$ =
      startRequest
        .validated$
        .debug('start-log-ping')
        .mapTo({ TYPE: 'START_STATUS' })

    const status$ =
      bot
        .status$
        .map
         ( (botStatus:string) => (
             { TYPE: 'STATUS'
             , DATA:
               { status: botStatus
               }
             }
           )
         )
        .debug('status')

    const startRequestError$ =
      startRequest
        .error$

    return (
      { message: status$
      , bot: startStatus$
      , error$: startRequestError$
      }
    )
  }

export
  { Status
  }


