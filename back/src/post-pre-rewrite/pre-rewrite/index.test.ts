import * as WebSocket from 'ws'

const ws = new WebSocket('ws://localhost:8080')

ws.on
   ( 'open'
   , () => { console.log('connection opened') }
   )

ws.on
   ( 'message'
   , (message) => { console.log(message) }
   )

ws.on
   ( 'close'
   , () => { console.log('connection closed') }
   )

// setInterval
// ( () => { ws.send(JSON.stringify({_name: 'Logout'}), (err) => {console.log(err)}) }
// , 1000
// )
const LOGIN_GOOD =
  { TYPE: 'LOGIN'
  , DATA:
    { userName: 'admin'
    , passWord: 'pass'
    }
  }

const LOGIN_BAD0 =
  { TYPE: 'LOGIN'
  , DATA:
    { userName: 'HENK'
    , passWord: 'PASS'
    }
  }

const LOGIN_BAD1 =
  { TYPE: 'LOGIN'
  , DATA:
    { userName: 'nope'
    , passWord: 'good'
    }
  }

const call =
  ([{ action, wait }, ...callList] ) => {
    setTimeout
    ( () => {
        ws.send(JSON.stringify(action))
        if( callList.length > 0) {
          call(callList)
        } else {
          console.log('Done')
        }
      }
    , wait
    )
  }

const calls =
  [ { action: LOGIN_BAD0 , wait: 1000 }
  , { action: LOGIN_BAD1, wait: 1000 }
  , { action: LOGIN_GOOD, wait: 1000 }
  ]

call(calls)
