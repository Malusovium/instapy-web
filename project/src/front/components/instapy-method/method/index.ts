// index
import sampleCombine from 'xstream/extra/sampleCombine'
import { intent } from './intent'
import { view } from './view'
import { Type } from 'instapy-tools'

import
  { State
  , Component
  } from './types'

import
  { map
  , compose
  , values
  , drop
  , path
  , equals
  , take
  } from 'rambda'

type ChildComponents =
  { [index:string]: Component }

const compList =
  (childComponents) =>
    ({DOM, onion}) => {
      const childComponentsSinks =
        map
        ( (component:Component) => component({DOM, onion})
        , values(childComponents)
        )
      const childComponentsDOM =
        map<any, any>(path('DOM'), childComponentsSinks)
      const childComponentsOnion =
        map(path('onion'), childComponentsSinks)


      return (
        { DOM: childComponentsDOM
        , onion: childComponentsOnion
        }
      )
    }

const method = 
  (childComponents: ChildComponents = {}) : Component =>
    ({DOM, onion}) => {
      const childComponentsSinks =
        compList(childComponents)({DOM, onion})

      const orderClick$ =
        DOM
          .select('[data-order]')
          .events('click')
          .debug('came here')
          .map(path('currentTarget.dataset.order'))

      const deleteClick$ =
        DOM
          .select('[data-delete]')
          .events('click')
          .mapTo((prevState) => undefined)

      return (
        { DOM:
            view
            ( onion.state$.debug('InstapyMethod State')
            , childComponentsSinks.DOM
            )
        , onion:
            intent
            ( DOM
            , childComponentsSinks.onion
            )
        , up$:
            orderClick$
              .filter(equals('UP'))
              .compose(sampleCombine(onion.state$))
              .map(([_, state]) => state)
              .map(path('order'))
        , down$:
            orderClick$
              .filter(equals('DOWN'))
              .compose(sampleCombine(onion.state$))
              .map(([_, state]) => state)
              .map(path('order'))
        , delete$:
            deleteClick$
              .compose(sampleCombine(onion.state$))
              .map(([_, state]) => state)
              .map(path('order'))
        }
      )
    }

export
  { State
  , method
  }
