import { equals } from 'rambda'

// export interface Transition {
//   property: string
//   time: string
//   from?: string
//   to?: string
// }

const propsToString = (first:string, second:string) =>
  (acc:any, curr:any) => [...acc, `${curr[first]} ${curr[second]}`]

const propsReducer = (prop: string, direction: string) =>
  (acc:any, curr:any) => ({
    ...acc,
    ...(direction !== undefined)
      ? ({[curr[prop]]: curr[direction]})
      : undefined
  })

export const bezier4 = (n1:number, n2:number, n3:number, n4:number) =>
  `cubic-bezier(${n1}, ${n2}, ${n3}, ${n4})`

export const eases =
  { backward: bezier4(.68,-0.55,.27,1.55)
  }

export interface Transition {
  property: string
  duration: number
  delay: number
  timing: string

  delayed?: object
  destroy?: object
}

const delayed = () => ({})
const removed = () => ({})

const getPropertie = (propertie:string) =>
  (obj:any) => obj[propertie]
const after = (affix:string) => (str:string) => str + affix

const transitionVal = (property: string, affix: string) =>
  (arr:object[]) =>
    arr.map(getPropertie(property))
       .map(after(affix))
       .join(', ')

const propVal = (prop:string, val:any) =>
  val === undefined
    ? ({})
    : ({ [prop]: val })

export const transition =
  (prop:string
  , dur:number = 0.4
  , delay:number = 0
  , timing: string = 'linear'
  ) => (addVall?:string | number, remVall?: string | number): Transition => (
    { property: prop
    , duration: dur
    , delay: delay
    , timing: timing

    , delayed: propVal(prop, addVall)
    , destroy: propVal(prop, remVall)
    }
  )

const transProperty = transitionVal('property', '')
const transDuration = transitionVal('duration', 's')
const transTiming = transitionVal('timing', '')
const transDelay = transitionVal('delay', 's')

const mergeReducer = (prop:string) =>
  (acc:object, curr:any) =>
    curr[prop] === undefined
      ? acc
      : ({...acc, ...curr[prop]})

const mergePropertie = (arr:any[], prop:string) =>
  arr.reduce(mergeReducer(prop), {})

const mergePropVal = (arr:any[], prop:string) =>
  equals({}, mergePropertie(arr, prop))
    ? ({})
    : ({[prop]: mergePropertie(arr, prop)})

export interface SnabbTransition {
  transitionProperty: string
  transitionDuration: string
  transitionTimingFunction: string
  transitionDelay: string

  delayed?: object
  destroy?: object
}

export const snabbTransition =
  (transitions:Transition[]): SnabbTransition => (
    { transitionProperty: transProperty(transitions)
    , transitionDuration: transDuration(transitions)
    , transitionTimingFunction: transTiming(transitions)
    , transitionDelay: transDelay(transitions)

    , ...mergePropVal(transitions, 'delayed')
    , ...mergePropVal(transitions, 'destroy')
    }
  )
