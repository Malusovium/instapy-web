import xs, { Stream } from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine'
import
  { isNil
  , equals
  , allPass
  , map
  , has
  , complement
  , propEq
  } from 'rambda'

const isNotNil = complement(isNil)

type ActivatorFn<T> =
  (activator:T) => boolean
type ActivateWhen =
  <T1, T2>(activatorFn: ActivatorFn<T2>) =>
    (main$: Stream<T1>, activator$: Stream<T2>) =>
      { activated$: Stream<T1>
      , error$: Stream<null>
      }
const activateWhen: ActivateWhen =
  (activatorFn) =>
    (main$, activator$) => {
      const combined$ =
        main$
          .compose(sampleCombine(activator$))
          .map
           ( ([message, activator]) =>
             activatorFn(activator)
                ? message
                : null
           )

      const activated$: Stream<any> =
        combined$
          .filter(isNotNil)

      const error$: Stream<any> =
        combined$
          .filter(isNil)

      return (
        { activated$: activated$
        , error$: error$
        }
      )
    }

type ForkStream =
  <T>(forkFn: (inputData: T) => boolean) =>
    (stream$: Stream<T>) =>
      { false$: Stream<any>
      , true$: Stream<any>
      }

const forkStream: ForkStream =
  (forkFn) =>
    (stream$) => (
      { false$:
          stream$
            .filter(complement(forkFn))
      , true$:
          stream$
            .filter(forkFn)
      }
    )

type ProtectedStream =
  ( TYPE: string
  , props?: string[]
  ) =>
    (main$: Stream<any>, authorize$: Stream<boolean>) =>
      { validated$: Stream<any>
      , error$: Stream<any>
      }
const protectedStream: ProtectedStream =
  (TYPE, props = [ 'TYPE' ]) =>
    (main$, authorize$) => {
      const rightType$ =
        main$
          .filter(has('TYPE'))
          .filter(propEq('TYPE', TYPE))

      const forkedAuth =
        activateWhen
        (equals(true))
        (rightType$, authorize$)

      const validAuth$ =
        forkedAuth.activated$

      const invalidAuth$ =
        forkedAuth
          .error$
          .mapTo
           ('Not authorized!')

      const hasAll =
        allPass
        (map(has, props))

      const forked =
        forkStream (hasAll) (validAuth$)

      const valid$ =
        forked.true$

      const invalidProps$ =
        forked
          .false$
          .mapTo
           ('Invalid props')

      const error$ =
        xs.merge(invalidAuth$, invalidProps$)
          .map
           ( (errorMessage: string) => (
               { TYPE: 'ERROR'
               , SUB_TYPE: TYPE
               , MESSAGE: errorMessage
               }
             )
           )

      return (
        { validated$: valid$
        , error$: error$
        }
      )
    }

export
  { activateWhen
  , protectedStream
  }
