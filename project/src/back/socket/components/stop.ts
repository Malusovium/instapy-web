import xs from 'xstream'
import
  { protectedStream
  , splitError
  } from 'utils/stream-helpers'

const Stop =
  ({ message, auth }:any) => {
    const stopRequest =
      protectedStream
      ( 'STOP' )
      (message, auth.authenticated$)

    const stopBot$ =
      stopRequest
        .validated$
        .mapTo
         ({ TYPE: 'STOP' })

    const startRequestError$ =
      stopRequest
        .error$

    return (
      { bot: stopBot$
      , error$: startRequestError$
      }
    )
  }

export
  { Stop
  }

