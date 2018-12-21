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
        .mapTo(null)
        // .mapTo({ TYPE: 'START_LOGS' })

    // const log$$ =
    // const log$$: Stream<Stream<string>> =
    //   bot.logs$
    //      .map(() => bot.logs$)
         // .flatten()
    const throttleLog$ =
     bot.logs$
        .fold
         ( (acc: string[], curr: string) =>
             startsWith('Attaching', curr)
               ? [ curr ]
               : [ ...acc, curr]
         , []
         )
        .debug('log arr')

    const storedlogs$ =
      startLogs$
        .compose(sampleCombine(throttleLog$))
        .map
         ( ([_, second]: any[]) =>
             concat
             ( xs.fromArray(second)
                 // .compose(delay(1000))
             , bot.logs$
             )
         )
        // .debug('this is?')
        .flatten()
        // .mapTo(bot.logs$)
        // .debug('start log')
        // .compose(sampleCombine(xs.of(bot.logs$)))
        // .map( ([_, second]) => second)
        // .flatten()
        .debug('log line')
      // bot
      //   .logs$
    const logs$ =
      // concat(storedlogs$, bot.logs$)
      //   .debug('log line')
      storedlogs$
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
      // , bot: startLogs$
      , error$: startRequestError$
      }
    )
  }

export
  { Logs
  }

