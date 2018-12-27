import xs from 'xstream'
import
  { protectedStream
  , splitError
  } from 'utils/stream-helpers'

const Config =
  ({ message, auth, bot }:any) => {
    const getRequest =
      protectedStream
      ( 'GET_CONFIG' )
      (message, auth.authenticated$)

    const saveRequest =
      protectedStream
      ( 'SAVE_CONFIG' )
      (message, auth.authenticated$)

    const getConfig$ =
      getRequest.validated$

    const saveConfig$ =
      saveRequest.validated$
        .map
         ( ({DATA}) => (
             { TYPE: 'SET_CONFIG'
             , DATA: DATA
             }
           )
         )

    const configResponse$ =
      bot
        .config$
        .compose(splitError)

    const succesConfig$ =
      configResponse$
        .out$
        .map
         ( (config: any[]) => (
             { TYPE: 'CONFIG'
             , DATA:
               { config: config }
             }
           )
         )

    const errorConfig$ =
      configResponse$
        .error$
        .mapTo
         ( { TYPE: 'ERROR'
           , SUB_TYPE: 'CONFIG'
           , MESSAGE: 'Could not load config.'
           }
         )

    return (
      { message: xs.merge(succesConfig$)
      , bot: xs.merge(getConfig$, saveConfig$)
      , error$: xs.merge(getRequest.error$, saveRequest.error$, errorConfig$)
      }
    )
  }

export
  { Config
  }
