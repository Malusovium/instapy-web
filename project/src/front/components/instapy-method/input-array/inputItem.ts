import xs, { Stream } from 'xstream'
import { div
       , i
       , input
       , VNode
       , DOMSource
       } from '@cycle/dom'
import { style } from 'typestyle'
import { horizontal } from 'csstips'

import { path } from 'rambda'

const intent =
  (DOM: DOMSource) => {
    const init$ = xs.of((prev) => prev)

    const input$ =
      DOM
        .select('input')
        .events('input')
        .map(path('target.value'))
        .map
         ( (newValue) => (prevValue) => newValue )

    const delete$ =
      DOM
        .select('[data-delete]')
        .events('click')
        .mapTo((prev) => undefined)

    return xs.merge(init$, input$, delete$)
  }

const wrapperClass =
  style
  ( { padding: '.2em'
    , borderRadius: '.2em'
    }
  , horizontal
  )

const inputClass =
  style
  ( { flex: 99
    }
  )

const deleteClass =
  style
  ( { background: 'rgba(255, 100, 100, 0.8)'
    , paddingTop: '.1em'
    , color: 'white'
    , cursor: 'pointer'
    , flex: 1
    }
  )

const view =
  (state$: Stream<any>) =>
    state$
      .map
       ( ( value
         ) =>
           div
           ( `.${wrapperClass}`
           , [ input
               ( { class:
                   { [inputClass]: true
                   }
                 , props:
                   { value: value
                   }
                 }
               )
             , div
               ( { dataset:
                   { delete: true
                   }
                 , class:
                   { [deleteClass]: true
                   }
                 }
               , i('.im.im-x-mark')
               )
             ]
           )
       )


const inputItem =
  ({DOM, onion}: any) => (
    { DOM: view(onion.state$)
    , onion: intent(DOM)
    }
  )

export
  { inputItem
  }
