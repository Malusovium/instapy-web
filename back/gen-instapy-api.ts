import { readFileSync
       , writeFileSync
       } from 'fs'

const README_FROM = __dirname + '/../data/InstaPy/README.md'
const API_JSON_TO = __dirname + '/../api.json'

const takeFrom =
  (from: string) =>
    (acc: string[], curr: string) =>
      curr.includes(from) || acc.length !== 0
        ? [ ...acc, curr ]
        : acc

const takeTill =
  (till: string) =>
    (acc: string[], curr: string, index:number, arr: string[]) =>
      arr.slice(0, index)
           .reduce
            ((acc:boolean, curr:string) => curr === till ? false : acc, true)
        ? [ ...acc, curr ]
        : acc

type Child =
  { name: string
  , children: string[]
  }

const replaceN =
  (value: any, n = 0, rev = false) =>
    (acc: any[], curr:any) =>
      acc.length === n
        ? [ ...acc, value ]
        : [ ...acc, curr ]

const dropN =
  (n: number) =>
    (acc:any[], curr:any, index:number) =>
      n <= index
        ? [...acc, curr]
        : acc

const extractMethodName =
  (method: string): string =>
    method
      .split('')
      .reduce(takeFrom('.'), [])
      .reduce(dropN(1), [])
      .reduce(takeTill('('), [])
      .reverse()
      .reduce(dropN(1), [])
      .reverse()
      .join('')

const isString =
  (val: string) =>
    val.startsWith(`'`)
    && val.endsWith(`'`)
    || val.startsWith(`"`)
    && val.endsWith('"')

const isBoolean =
  (val: string) =>
    val === 'True' || val === 'False'

const isNumber =
  (val: any) =>
    !isNaN
     ( typeof val === 'string'
         ? val.split('*')[0]
         : val
     )

const isArray =
  (val: any) =>
    typeof val === 'string'
      ? val.startsWith('[') && val.endsWith(']')
      : false

const isNone =
  (val: any) =>
    val === 'None'

const extractArgType =
  (val: string): string =>
    isNone(val) ? 'None'
    : isBoolean(val) ? 'Boolean'
    : isNumber(val) ? 'Number'
    : isString(val) ? 'String'
    : isArray(val) ? 'Array'
    : `Error<Couldn't extract type>`

const formatArg =
  ([key, val]: string[]) => (
    { name: key
    , type: [ extractArgType(val) ]
    , examples: [ val ]
    }
  )

const extractTypeArg =
  (val: string) =>
    val.includes('=')
      ? formatArg(val.split('='))
      : val

const prefixIf =
  (prefix: string, ifFunc: (val:string) => boolean) =>
    (val: string) =>
      ifFunc(val)
        ? `${prefix}${val}`
        : val

const logIt =
  (val:any) => { console.log(val); return val}

// const callMethodOnString =
//   (str:any, method: any, arg: string) =>
//     str[method](arg)
//
const stringifyArray =
  ( start: string
  , end: string
  , [ startMethod, endMethod ] = [ 'startsWith', 'endsWith' ]
  ) =>
    (acc: any[], curr: string | string[]) =>
      acc.length > 0
        && typeof curr === 'string'
        && typeof acc[acc.length - 1] === 'string'
        && acc[acc.length - 1][startMethod](start)
        && !acc[acc.length - 1][endMethod](end)
          ? acc
              .reduce
               ( replaceN
                 ( `${acc[acc.length - 1]},${curr}`
                 , acc.length -1
                 )
               , []
               )
          : [ ...acc, curr ]

const unNamed =
  (val:string) =>
    val.includes('=')
      ? val
      : `UnNamed${extractArgType(val)}=${val}`

type Arg =
  { name: string
  , type: string[]
  , examples: string[]
  }

type Method =
  { name: string
  , args: Arg[]
  }

const removeSurroundingWhiteSpace =
  (check: string) =>
    (str: string) =>
      typeof str !== 'string'
        ? str
        : str.split('')
            .reduce
             ( (acc: string[], curr: string, index: number, arr: string[]) =>
               index > 0
               && index < arr.length - 1
               && curr === ' '
               && (arr[index - 1] === check || arr[index + 1] === check)
               ? acc
               : [ ...acc, curr ]
             , []
             )
            .join('')

const extractMethodArgs =
  (method: string): Method[] =>
    method
      .split('')
      .reduce(takeFrom('('), [])
      .reduce(dropN(1), [])
      .reverse()
      .reduce(takeFrom(')'), [])
      .reduce(dropN(1), [])
      .reverse()
      .join('')
      .split(', ')
      .reduce(stringifyArray('[', ']'), [])
      .reduce(stringifyArray('=[', ']', [ 'includes', 'endsWith' ]), [])
      .reduce(stringifyArray('=(', ')', [ 'includes', 'endsWith' ]), [])
      // .map(removeSurroundingWhiteSpace('='))
      .map(unNamed)
      // .reduce(removeSurroundingWhiteSpace('='), [])
      .map(extractTypeArg)
      // .map(logIt)

const extractMethod =
  (method: string) =>
    method.startsWith('session.')
      ? { name: extractMethodName(method)
        , args: extractMethodArgs(method)
        }
      : '########## Not a session! ##########'

const isLike =
  (like:string, Not = false) =>
    (val:any) =>
      typeof val === 'string'
        ? val.includes(like)
          ? !Not
          : Not
        : Not

const readme = readFileSync(README_FROM, 'utf8').split('\n')

const reduceIndex =
  (findValue: any) =>
    (acc: number, curr: any, index: number) =>
      findValue.name === curr.name
        ? index
        : acc

const removeDuplicates =
  (acc: any[], value: any) =>
    acc.includes(value)
      ? acc
      : [ ...acc, value ]

const mergeArgs =
  (acc: Arg[], curr: Arg) => {
    const indexArg =
      acc.reduce(reduceIndex(curr), -1)

    return indexArg === -1
      ? [ ...acc, curr ]
      : acc
          .reduce
           ( replaceN
             ( { name: acc[indexArg].name
               , type:
                   [ ...acc[indexArg].type, ...curr.type ]
                      .reduce(removeDuplicates, [])
               , examples: 
                   [ ...acc[indexArg].examples, ...curr.examples ]
                      .reduce(removeDuplicates, [])
               }
             , indexArg
             )
           , []
           )
  }

const mergeMethods =
  (acc: any[], curr: any) => {
    const indexMethod =
      acc.reduce(reduceIndex(curr), -1)

    return indexMethod === -1
      ? [ ...acc, curr ]
      : acc
          .reduce
           ( replaceN
             ( { name: acc[indexMethod].name
               , args:
                   [ ...acc[indexMethod].args, ...curr.args ]
                     .reduce(mergeArgs, [])
               }
             , indexMethod
             )
           , []
           )
  }

const availableFeatures =
  readme
    .reduce(takeFrom('## InstaPy Available Features'), [])
    .reverse()
    .reduce(takeFrom('## Use a proxy'), [])
    .reduce(dropN(1), [])
    .reverse()
    .map(removeSurroundingWhiteSpace('('))
    .map(extractMethod)
    .filter(isLike('########## Not a session! ##########', true))
    .reduce(mergeMethods, [])

const flattenArray =
  (acc: any[], curr: any[]) =>
    [ ...acc, ...curr ]

const args =
  availableFeatures
    .map( (methods:any) => methods.args)
    .reduce(flattenArray, [])
    .reduce(mergeArgs, [])

const collapseArgs =
  (method: any) => (
    { name: method.name
    , args:
        method.args
          .map( (arg: Arg) => arg.name )
    }
  )

const methods =
  availableFeatures
    .map(collapseArgs)

const api =
  { args
  , methods
  }

writeFileSync(API_JSON_TO, JSON.stringify(api, null, 2))

console.log(api)

const sleep =
  async (duration: number): Promise<any> =>
    new Promise( (res) => setTimeout(res, duration))

sleep(9999999)
