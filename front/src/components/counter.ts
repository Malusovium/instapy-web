import xs, { Stream } from 'xstream'
import {
  button,
  i,
  div,
  h2,
  span,
  VNode, DOMSource } from '@cycle/dom'
import { StateSource } from 'cycle-onionify'

import { style } from 'typestyle'

import { BaseSources, BaseSinks } from '../interfaces'

// Types
export interface Sources extends BaseSources {
  onion: StateSource<State>
}
export interface Sinks extends BaseSinks {
  onion?: Stream<Reducer>
}

// State
export interface State {
  count: number
}
export const defaultState: State = {
  count: 30
}
export type Reducer = (prev: State) => State | undefined

export const Counter = ({ DOM, onion }: Sources): Sinks => {
  const action$: Stream<Reducer> = intent(DOM)
  const vdom$: Stream<VNode> = view(onion.state$)

  const routes$ = DOM
    .select('.navigate')
    .events('click')
    .mapTo('/p2')

  return {
    SEO: xs.periodic(1000)
      .map( i => Date().split(' ')[4])
      .map( nowTime => [`<title>${nowTime}</title>`])
    ,
    DOM: vdom$,
    onion: action$,
    router: routes$
  }
}

const intent = (DOM: DOMSource): Stream<Reducer> => {
  const init$ = xs.of<Reducer> (
    prevState => (prevState === undefined ? defaultState : prevState)
  )

  const add$: Stream<Reducer> = DOM.select('.add')
    .events('click')
    .mapTo<Reducer>(state => ({ ...state, count: state.count + 1 }))

  const subtract$: Stream<Reducer> = DOM.select('.subtract')
    .events('click')
    .mapTo<Reducer>(state => ({ ...state, count: state.count - 1 }))

  return xs.merge(init$, add$, subtract$)
}

const view = (state$: Stream<State>): Stream<VNode> =>
  state$.map(({ count }) => 
    div({attrs: {class: style({background: 'lightBlue'})}}, [
      h2(`My Awesome Cycle.js app - Page 1`),
      h2( process.env.ENV ),
      h2(process.env.URL),
      h2('update'),
      i('.im.im-spotify'),
      span(`Counter: ${count}`),
      button('.add', 'Increase'),
      button('.subtract', 'Decrease'),
      button('.navigate', 'Page 2'),
    ])
  )
