import { Stream } from 'xstream'
import { DOMSource, VNode } from '@cycle/dom'
import { StateSource } from 'cycle-onionify'

export type State =
  { name: string
  , isIncluded: boolean
  , value: any
  , _default: any
  }

export type Reducer =
  (prevState: State) => State

export type Sources =
  { DOM: DOMSource
  , onion: StateSource<State>
  }

export type Sinks =
  { DOM: Stream<VNode>
  , onion: Stream<Reducer>
  }

export type Component =
  (sources: Sources) => Sinks
