import xs from 'xstream'
import
  { protectedStream
  , splitError
  } from 'utils/stream-helpers'

const Logs =
  ({ bot, auth, message }:any) => {
    const startRequest =
      protectedStream
      ( 'SUBSCRIBE_LOGS' )
      (message, auth.authenticated$)

    const startLogs$ =
      startRequest
        .validated$
        .debug('start-log-ping')
        .mapTo({ TYPE: 'START_LOGS' })

    const log$ =
      bot
        .logs$
        .map
         ( (log:string) => (
             { TYPE: 'LOG'
             , DATA:
               { log: log
               }
             }
           )
         )

    const startRequestError$ =
      startRequest
        .error$

    return (
      { message: log$
      , bot: startLogs$
      , error$: startRequestError$
      }
    )
  }

export
  { Logs
  }

