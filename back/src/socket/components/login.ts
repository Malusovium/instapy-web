import { has } from 'rambda'

type Action =
  { TYPE: string
  , DATA?: any
  }
type isOfType =
  (typeSelector: string) =>
    (action: Action) => boolean

const isOfType: isOfType =
  (typeSelector) =>
    ({ TYPE }) => TYPE === typeSelector

// const pathExists: PathExists =
//   (dir) =>
//     compose
//     ( complement
//     , isNil
//     // , path(dir)
//     )

const Login =
  ({ message$, auth$ }: any) => {
    const loginRequest$ =
      message$
        .debug('in')
        .filter(isOfType('LOGIN'))
        .filter(has('DATA'))

    return (
      { auth$: loginRequest$
      , message$: auth$
      }
    )
  }

export
  { Login
  }
