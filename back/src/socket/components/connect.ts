import
  { equals
  , propEq
  , has
  } from 'rambda'
import xs from 'xstream'

const Connect =
  ({ message, auth}: any) => {
    const connectRequest$ =
      message
        .filter(propEq('TYPE', 'CONNECT'))
        .filter(has('DATA'))

    const connectSucces$ =
      auth
        .connect$
        .filter(equals(true))
        .debug('succes')
        .mapTo
         ( { TYPE: "SUCCES"
           , SUB_TYPE: "CONNECT"
           }
         )

    const connectError$ =
      auth
        .connect$
        .filter(equals(false))
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

