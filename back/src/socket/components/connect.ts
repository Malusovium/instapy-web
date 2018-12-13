import
  { equals
  , propEq
  , has
  } from 'rambda'
import xs from 'xstream'

import
  { splitError } from 'utils/stream-helpers'

const Connect =
  ({ message, auth}: any) => {
    const connectRequest$ =
      message
        .filter(propEq('TYPE', 'CONNECT'))
        .filter(has('DATA'))

    const forkedConnect =
      auth
        .connect$
        .compose(splitError)

    const connectSucces$ =
      forkedConnect
        .out$
        .debug('succes')
        .mapTo
         ( { TYPE: "SUCCES"
           , SUB_TYPE: "CONNECT"
           }
         )

    const connectError$ =
      forkedConnect
        .error$
        .mapTo
         ( { TYPE: "ERROR"
           , SUB_TYPE: "CONNECT"
           , MESSAGE: "Wrong key"
           }
         )

    return (
      { message: connectSucces$
      , auth: connectRequest$
      , error$: connectError$
      }
    )
  }

export
  { Connect
  }

