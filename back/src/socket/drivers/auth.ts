import xs, { Stream } from 'xstream'

type LOGIN_ACTION_DATA =
  { userName: string
  , passWord: string
  }
type LOGIN_ACTION =
  { TYPE: 'LOGIN'
  , DATA: LOGIN_ACTION_DATA
  }

const makeAuthDriver =
  () =>
    (action$: Stream<LOGIN_ACTION>) => {
      const authProducer =
        { start:
            (listener: any) => {
              action$
                .addListener
                 ( { next:
                       ({ DATA }) => {
                         if (DATA.userName === 'HENK' && DATA.passWord === 'PASS') {
                           listener
                             .next('Correct')
                         } else {
                           listener
                             .next('Wrong')
                         }
                       }
                   }
                 )
            }
        , stop: () => {}
        }

      return xs.create(authProducer)
    }

export
  { makeAuthDriver
  }
