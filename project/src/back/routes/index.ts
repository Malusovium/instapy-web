import { Route } from 'utils/router'
import { login } from './login'

const routes: Route =
  { sub:
    { 'login':
      { POST: login
      }
    }
  , '*': async () => 'default api route'
  }

export
  { routes
  }
