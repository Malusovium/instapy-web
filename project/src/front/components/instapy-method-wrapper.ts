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
           .map(path('name'))
           .compose(dropRepeats())
           .remember()
           .map( (name) => InstapyMethods[name])
           .map((component) => component({DOM, onion}))

      const MethodOnionSink$ =
         Method
          .map(path('onion'))
          .flatten()

      const MethodDOMSink$ =
         Method
           .map(path('DOM'))
           .flatten()

      return (
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
