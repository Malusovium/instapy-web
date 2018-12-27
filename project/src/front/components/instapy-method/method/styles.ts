// styles
import { style} from 'typestyle'
import { vertical, horizontal } from 'csstips'

const container =
  style
  ( { position: 'relative'
    // , backgroundColor: '#eee'
    , fontSize: '.8em'
    , borderRadius: '.4em'
    , boxShadow: '0 .1em .2em 0 rgba(0,0,0,.2)'
    , marginBottom: '.6em'
    , overflow: 'hidden'
    }
  , vertical
  )

const head =
  style
  ( { fontSize: '1.4em'
    , position: 'relative'
    , color: 'white'
    , background: '#ccc'
    , justifyContent: 'space-between'
    }
  , horizontal
  )

const isClosed =
  style
  ( { position: 'absolute'
    , top: 0
    , bottom: 0
    , left: 0
    , right: 0
    }
  )

const openSwitch =
  style
  ( { justifyContent: 'center'
    , padding: '.4em'
    , color: 'white'
    , cursor: 'pointer'
    }
  , horizontal
  )

const isOpen =
  style
  ( { background: 'rgba(120, 120, 200, 0.8)'
    }
  )

const name =
  style
  ( { padding: '.4em'
    }
  )

const cross =
  style
  ( { background: 'rgba(255, 100, 100, 0.8)'
    , cursor: 'pointer'
    , padding: '.4em'
    , zIndex: 1
    }
  )

const order =
  style
  ( { position: 'absolute'
    , justifyContent: 'center'
    , top: 0
    , left: 0
    , right: 0
    , bottom: 0
    , $nest:
      { '> div':
        { padding: '.2em'
        , paddingTop: '.4em'
        , background: 'rgba(100,100,200, 0.2)'
        , cursor: 'pointer'
        }
      }
    }
  , horizontal
  )

export
  { container
  , head
  , isOpen
  , isClosed
  , openSwitch
  , name
  , cross
  , order
  }
