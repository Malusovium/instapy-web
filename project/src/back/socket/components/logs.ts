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
    const sub =
      protectedStream
      ( 'SUBSCRIBE_LOGS' )
      (message, auth.authenticated$)

    const unSub =
      protectedStream
      ( 'UN_SUBSCRIBE_LOGS' )
      (message, auth.authenticated$)

    const startLogs$ =
      sub
        .validated$
        .mapTo({ TYPE: 'START_LOGS' })

    const stopLogs$ =
      unSub
        .validated$
        .mapTo({ TYPE: 'STOP_LOGS' })

    const logs$ =
      bot
        .logs$
        .debug('new')
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

    const protectedError$ =
      xs.merge(sub.error$, unSub.error$)

    return (
      { message: logs$
      , bot: xs.merge(startLogs$, stopLogs$)
      , error$: protectedError$
      }
    )
  }

export
  { Logs
  }

