import xs from 'xstream'
import dropRepeats from 'xstream/extra/dropRepeats'
import
  { protectedStream
  , splitError
  } from 'utils/stream-helpers'

const Status =
  ({ bot, auth, message }:any) => {
    const sub =
      protectedStream
      ('SUBSCRIBE_STATUS')
      (message, auth.authenticated$)

    const unSub =
      protectedStream
      ('UN_SUBSCRIBE_STATUS')
      (message, auth.authenticated$)

    const startStatus$ =
      sub
        .validated$
        .mapTo({ TYPE: 'START_STATUS' })

    const stopStatus$ =
      unSub
        .validated$
        .mapTo({ TYPE: 'STOP_STATUS' })

    const status$ =
      bot
        .status$
        .flatten()
        .map
         ( (botStatus:string) => (
             { TYPE: 'STATUS'
             , DATA:
               { status: botStatus
               }
             }
           )
         )

    const protectedError$ =
      xs.merge(sub.error$, unSub.error$)

    return (
      { message: status$
      , bot: xs.merge(startStatus$, stopStatus$)
      , error$: protectedError$
      }
    )
  }

export
  { Status
  }


