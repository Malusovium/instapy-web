import { Component } from './interfaces'

import mainBackground from './assets/main-background.png'
import iconLogo from './assets/instapy-web-icon-filled-white.svg'

import { MainMenu } from './components/main-menu'
import { Login } from './components/login'
import { Bot } from './components/bot'
import { Logs } from './components/logs'

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
    { component: MainMenu(style, 'bot', Bot)
    , scope: 'mainMenu'
    }
  , '/config':
    { component: MainMenu(style, 'config')
    , scope: 'mainMenu'
    }
  , '/logs':
    { component: MainMenu(style, 'logs', Logs)
    , scope: 'mainMenu'
    }
  // , '/p2': { component: Speaker, scope: 'speaker' }
  }

export const initialRoute = '/login'
