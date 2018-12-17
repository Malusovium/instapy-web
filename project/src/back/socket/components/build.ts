import xs from 'xstream'
import
  { protectedStream
  , splitError
  } from 'utils/stream-helpers'

const Build =
  ({ message, auth }:any) => {
    const buildRequest =
      protectedStream
      ( 'BUILD' )
      (message, auth.authenticated$)

    const buildBot$ =
      buildRequest
        .validated$

    const buildRequestError$ =
      buildRequest
        .error$

    return (
      { bot: buildBot$
      , error$: buildRequest.error$
      }
    )
  }

export
  { Build
  }
