import { compose, map, zip, range } from 'rambda'

type IMap =
  <A, B>(fn: (a: A, index: number) => B) =>
    (arr: A[]) =>
      B[]

const iMap: IMap =
  (fn) =>
    (arr) => {
      console.log(arr)

      return compose<any, any, any>
      ( map(([index, value]) => fn(value, index))
      , zip(range(0, arr.length))
      )(arr)
    }

export
  { iMap
  }
