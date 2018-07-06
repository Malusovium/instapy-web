import { Component } from './interfaces'

import mainBackground from './assets/main-background.png'
import iconLogo from './assets/instapy-web-icon-filled-white.svg'
import { Login } from './components/login'
import { MainMenu } from './components/main-menu'

export type RouteValue =
  { component: Component
  , scope: string
  }

export type Routes =
  { readonly [index: string]: RouteValue }

const style =
  { background: '#efd9ce'
  , backgroundImage: `url(${mainBackground})`
  , icon: `url(${iconLogo})`
  , mainButton: '#7161ef'
  , subButton: '#f991cc'
  , mainText: '#1c1d21'
  , subText: '#a288a6'
  }

export const routes: Routes =
  { '/login': 
    { component: Login(style)
    , scope: 'login'
    }
  , '/bot':
    { component: MainMenu(style)
    , scope: 'bot'
    }
  // , '/p2': { component: Speaker, scope: 'speaker' }
  }

export const initialRoute = '/login'
