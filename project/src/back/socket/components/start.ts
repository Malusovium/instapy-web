import xs from 'xstream'
import
  { protectedStream
  , splitError
  } from 'utils/stream-helpers'

const Start =
  ({ message, auth }:any) => {
    const startRequest =
      protectedStream
      ( 'START' )
      (message, auth.authenticated$)

    const startBot$ =
      startRequest
        .validated$
        .mapTo
         ({ TYPE: 'START' })

    const startRequestError$ =
      startRequest
        .error$

    return (
      { bot: startBot$
      , error$: startRequestError$
      }
    )
  }

export
  { Start
  }
