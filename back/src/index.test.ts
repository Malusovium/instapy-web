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

setInterval
( () => { ws.send(JSON.stringify({_name: 'Logout'}), (err) => {console.log(err)}) }
, 1000
)
