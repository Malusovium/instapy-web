import { Route } from 'utils/router'

const routes: Route =
  { sub:
    { 'login':
      { POST: async () => 'login Route'
      }
    }
  , '*': async () => 'default api route'
  }

export
  { routes
  }
