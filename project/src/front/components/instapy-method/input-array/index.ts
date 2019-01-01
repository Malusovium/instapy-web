// index
import xs from 'xstream'
import { div } from '@cycle/dom'
import { makeCollection } from 'cycle-onionify'
import isolate from '@cycle/isolate'
import { inputItem } from './inputItem'
import { intent } from './intent'
import { view } from './view'

import { State
       , Reducer
       , Sources
       , Sinks
       , Component
       } from './types'

const inputArray: Component =
  ({DOM, onion}) => {
    const itemNodesComponent =
      makeCollection
      ( { item: inputItem
        , itemKey: (childState, index) => String(index)
        , itemScope: (key) => key
        , collectSinks:
            (instances) => {
              return (
                { onion: instances.pickMerge('onion')
                , DOM:
                    instances
                      .pickCombine('DOM')
                      .map((vNodes) => div(vNodes))
                }
              )
            }
        }
      )

    const itemNodes =
      isolate
      ( itemNodesComponent
      , 'value'
      )({DOM, onion})

    return (
      { DOM: view(onion.state$, itemNodes.DOM)
      , onion: xs.merge(intent(DOM), itemNodes.onion)
      }
    )
  }

export
  { State
  , inputArray
  }
