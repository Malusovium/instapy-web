import { makeRouter } from './router'

// test 1 start
const routes =
  { GET: () => Promise.resolve('what')
  }

const mockRequest1 =
  { url: '/my-route'
  , method: 'GET'
  }

// router(routes)(mockRequest1)(mockRequest1)
//   .then(console.log)
// console.log('end test 1')

//end

// test 2 start
const routes2 =
  { sub:
    { 'sub-route-1':
      { GET: () => Promise.resolve('sub-route-1')
      }
    , 'sub-route-2':
      { GET: () => Promise.resolve('sub-route-2')
      , '*': () => Promise.resolve('default, sub-route-2')
      }
    }
  , '*': () => Promise.resolve('default')
  }

const mockRequest2 =
  { url: '/sub-route-1/eawdwadwa//fwafaw'
  , method: 'GET'
  }

makeRouter(routes2)(mockRequest2)(mockRequest2)
  .then(console.log)
//end
