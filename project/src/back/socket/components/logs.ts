import xs, { Stream } from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine'
import delay from 'xstream/extra/delay'
import concat from 'xstream/extra/concat'
import
  { startsWith
  } from 'rambda'
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

    const logs$ =
      startLogs$
        .mapTo(bot.logs$)
        .flatten()
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
      { message: logs$
      , error$: startRequestError$
      }
    )
  }

export
  { Logs
  }

