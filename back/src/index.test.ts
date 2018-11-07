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
    { userName: 'HENK'
    , passWord: 'PASS'
    }
  }

const LOGIN_BAD =
  { TYPE: 'LOGIN'
  , DATA:
    { userName: 'nope'
    , passWord: 'good'
    }
  }

setTimeout
( () => {
    ws.send(JSON.stringify(LOGIN_BAD))
  }
, 2000
)
