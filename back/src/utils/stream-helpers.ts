import xs, { Stream } from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine'
import concat from 'xstream/extra/concat'
import
  { isNil
  , equals
  , allPass
  , path
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

type NestStream =
  (in$: Stream<any>) => Stream<Stream<any>>
const nestStream: NestStream =
  (in$) =>
    in$
      .map
       ( data =>
         xs.of(data)
       )

type NestOp =
  (in$$: Stream<Stream<any>>) => Stream<Stream<any>>
const nestOp =
  (opFn: (arg:any) => any) =>
    (in$$: Stream<Stream<any>>) =>
      in$$
        .map
         (in$ =>
            in$.map(opFn)
         )

type Out$ = Stream<any>
type Error$ = Stream<any>
type ForkedSteams =
  { out$: Out$
  , error$: Error$
  }

type FailableFn = (args: any) => any
type ForkError =
  (in$$: Stream<Stream<any>>) =>
    ForkedSteams
const splitError: ForkError =
  (in$$) => {
    const out$ =
      in$$
        .map
         ( fn$ =>
             fn$
               .replaceError(() => xs.never())
         )
        .flatten()
    const error$ =
      in$$
        .map
         ( fn$ =>
             fn$
               .filter(() => false)
               .replaceError(() => xs.of('Err'))
         )
        .flatten()

    return (
      { out$: out$
      , error$: error$
      }
    )
  }

const forkError2 =
  (in$: Stream<any>) => {
    const pingOnError$ =
      in$
        .filter(() => false)
        .replaceError(() => xs.of())
        .flatten()
    // const pinger$ = xs.merge(in$, pingOnError$)
    // const new$ =
    //   pinger$
    //     .mapTo(in$)
    const new$ =
      in$
        .mapTo(xs.merge(in$, pingOnError$))

    const out$ =
      new$
        .map
         ( cIn$ =>
             cIn$
               .replaceError(() => xs.never())
         )
        .flatten()

    const error$ =
      new$
        .map
         ( cIn$ =>
             cIn$
               .filter(() => false)
               .replaceError(() => xs.of('Err'))
         )
        .flatten()

      // .sampleCombine(xs.of(in$))
      // .mapTo()

    return (
      { out$: out$
      , error$: error$
      }
    )
  }

export
  { activateWhen
  , protectedStream
  , nestOp
  , nestStream
  , splitError
  }
