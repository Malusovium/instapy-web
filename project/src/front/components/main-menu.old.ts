import xs, { Stream } from 'xstream'
import {
  div,
  VNode, DOMSource } from '@cycle/dom'
import { StateSource } from 'cycle-onionify'
import dropRepeats from 'xstream/extra/dropRepeats'

import { style, stylesheet } from 'typestyle'
import * as csstips from 'csstips'

import { BaseSources, BaseSinks } from '../interfaces'

export interface Sources extends BaseSources {
  onion: StateSource<State>
}
export interface Sinks extends BaseSinks {
  onion?: Stream<any>
  router?: Stream<any>
}

export interface State {
  myNumber: number
  currentPath: string
}

export const defaultState: State = {
  myNumber: 42,
  currentPath: "no path?"
}

export type Reducer = (prev: State) => State | undefined

export const MainMenu = ({ DOM, onion, router}: Sources): Sinks => {
  const action$: Stream<Reducer> = intent(DOM)
  const vdom$: Stream<VNode> = view(onion.state$)

  const navCalendar$ = DOM
    .select('.nav-calendar')
    .events('click')
    .mapTo('/calendar')

  const navProjects$ = DOM
    .select('.nav-projects')
    .events('click')
    .mapTo('/projects')

  const navPlan$ = DOM
    .select('.nav-plan')
    .events('click')
    .mapTo('/plan')

  const routes$ = xs.merge(
      navCalendar$,
      navProjects$,
      navPlan$,
    )

  const getPath$ = router.history$
      // .debug('?')
      .map( ({pathname}:any):Reducer =>
        (prev:State) => ({
          ...prev,
          currentPath: pathname,
        })
      )

  const onion$ = xs.merge(
    action$,
    getPath$,
  )

  return {
    // SEO: xs.of([`<title> My Title! </title>`]),
    DOM: vdom$,
    onion: onion$,
    router: routes$,
  }
}

const intent = (DOM: DOMSource): Stream<Reducer> => {
  const init$ = xs.of<Reducer>(
    prevState => (prevState === undefined ? defaultState : prevState)
  )

  return xs.merge(
    init$
  )
}

const css = stylesheet({
  container: {
    fontSize: '1em',
    // { minHeight: '1em'},
    background: 'blue',
    width: '100%',
    ...csstips.horizontal
  },
  item: {
    padding: '.6em',
    background: 'green',
    textAlign: 'center',
    ...csstips.flex1,
    $nest: {
      '&:hover': {
        cursor: 'pointer'
      }
    }
  },
  itemActive: {
    background: 'lightgreen',
    // $nest: {
    //   '&:hover': {
    //     cursor: 'default',
    //   }
    // }
  }
})

// const menuContainer = style(
//   { fontSize: '1em'},
//   // { minHeight: '1em'},
//   { background: 'blue'},
//   { width: '100%'},
//   csstips.horizontal
// )
// const menuItem = style(
//   { padding: '.6em'},
//   { background: 'green'},
//   { textAlign: 'center'},
//   csstips.flex1
// )
//

const startArrayCompare = ([headSource, ...tailSource]:any[], [headCompare, ...tailCompare]:any[]):boolean => headSource === undefined
  ? true
  : headSource !== headCompare
    ? false
    : startArrayCompare(tailSource, tailCompare)

const isRootPath = (path:string, currentPath:string) => {
  const pathArray = path.split('/')
  const currentPathArray = currentPath.split('/')

  return startArrayCompare(pathArray, currentPathArray)
}


const menuItem = (selector:string, text:string, path: string, currentpath: string) => {
  const isActive = isRootPath(path, currentpath) ? `.${css.itemActive}` : ''

  return div(`.${css.item}.${selector}${isActive}`, text)
}

const view = (state$: Stream<State>): Stream<VNode> =>
  state$
    .map( ({ myNumber, currentPath }) =>
      div(`.${css.container}`, [
        menuItem('nav-calendar', 'Calendar', '/calendar', currentPath),
        menuItem('nav-projects', 'Projects', '/projects', currentPath),
        menuItem('nav-plan', 'Plan', '/plan', currentPath),
        // div(`.${css.item}.nav-calendar`, 'Calendar'),
        // div(`.${menuItem}.nav-login`, 'Login'),
        // div(`The answer to everything is... ${myNumber}`)
      ])
    )
