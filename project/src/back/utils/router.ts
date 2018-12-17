import { isNil
       , flip
       , path
       , equals
       , startsWith
       , complement
       , dropLast
       , anyPass
       , compose
       , type as rType
       } from 'rambda'
import { isPathType } from './logic'
import { throwAt } from './error'
import { sendStatic } from './static'

// maybe later
const makeStaticRoutes =
  () => {}

const makeRESTRoutes =
  () => {}

type RequestHandle = (req:any) => Promise<any>
type POST = RequestHandle
type GET = RequestHandle
type DEFAULT = RequestHandle

type Method =
  'GET' | 'POST'
type Dir =
  string
type Path =
  Dir[]

const defaultErrorRoute: RequestHandle =
  (req) => Promise.resolve('404 not found')

type PickFirstList<T> = (check: Array<T | undefined>) => T
type FirstExist = <T>(def: T) => PickFirstList<T>
const firstExist: FirstExist =
  (def) => {
    const pickFirstList: PickFirstList<typeof def> =
      ([first, ...rest]) =>
        first !== undefined ? first
        : rest.length !== 0 ? pickFirstList(rest)
        : def

    return pickFirstList
  }

type Routes =
  { [index: string]: Route }
type Route =
  { sub?: Routes
  , GET?: GET
  , POST?: POST
  , '*'?: DEFAULT
  }
type FlowRoute =
  (path: Path, routes: Route, handler?: RequestHandle) => RequestHandle
type SetupFlowRoute =
  (method: Method) => FlowRoute

const setupFlowRoute: SetupFlowRoute =
  (method) => {
    const flowRoute: FlowRoute =
      ( [ nextPath, ...restPath ]
      , route
      , handler
      ) => {
        if ( nextPath === undefined ) {
          return firstExist
                 ( defaultErrorRoute )
                 ( [ route[method]
                   , route['*']
                   , handler
                   ]
                 )
        } else if ( route.sub === undefined
                  || route.sub[nextPath] === undefined
                  ) {
          return firstExist
                 ( defaultErrorRoute )
                 ( [ route['*']
                   , handler
                   ]
                 )
        } else {
            const nextHandler =
              firstExist
              ( handler )
              ( [ route['*'] ])
            return flowRoute
                   ( restPath
                   , route.sub[nextPath]
                   , nextHandler
                   )
        }
      }

    return flowRoute
  }

type MakeRouter =
  (routes: Route) =>
    (req:any) => RequestHandle

const makeRouter: MakeRouter =
  (routes) =>
    (req) => {
      const flowRoute = setupFlowRoute(req.method)

      const path =
        req
          .url
          .split('/')
          .filter( (dir: Dir) => dir !== '')
      // console.log(path)
      const handler =
        flowRoute
        ( path
        , routes
        )

      return handler
    }

export
  { Routes
  , Route
  , makeRouter
  }
