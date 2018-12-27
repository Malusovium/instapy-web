import { Stream } from 'xstream'
import { DOMSource, VNode } from '@cycle/dom'
import { StateSource } from 'cycle-onionify'

type State =
  { name: string
  , isIncluded: boolean
  }

type Reducer =
  (prevState: State) => State

type Sources =
  { DOM: DOMSource
  , onion: StateSource<State>
  }

type Sinks =
  { DOM: Stream<VNode>
  , onion: Stream<Reducer>
  }

type Component =
  (sources: Sources) => Sinks

export
  { Component
  , State
  , Reducer
  }
