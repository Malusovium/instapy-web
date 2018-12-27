import xs from 'xstream'
import dropRepeats from 'xstream/extra/dropRepeats'
import isolate from '@cycle/isolate'

import
  { path
  } from 'rambda'

const InstapyMethodWrapper =
  (InstapyMethods: any) =>
     ({DOM, onion}) => {
      const Method =
         onion
           .state$
           // .take(1)
           .map(path('name'))
           // .take(1)
           .compose(dropRepeats())
           .debug('internal')
           // .compose(dropRepeats())
           .remember()
           // .startWith('__init__')
           .map
            ( (name) => InstapyMethods[name])
           .map((component) => component({DOM, onion}))
           .debug('comp')

      const MethodOnionSink$ =
         Method
          .map(path('onion'))
          .flatten()

      const MethodDOMSink$ =
         Method
           .map(path('DOM'))
           .flatten()

      // const tempmm$ = InstapyMethods['__init__']({DOM, onion})

      return (
        // { DOM: tempmm$.DOM
        // , onion: tempmm$.onion
        //     // .compose(dropRepeats())
        // }
        { DOM: xs.merge(MethodDOMSink$)
        , onion: xs.merge(MethodOnionSink$)
        , delete$: Method.map(path('delete$')).flatten()
        , up$: Method.map(path('up$')).flatten()
        , down$: Method.map(path('down$')).flatten()
        }
      )
    }

export
  { InstapyMethodWrapper
  }
