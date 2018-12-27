// styles
import { style} from 'typestyle'
import
  { vertical
  , horizontal
  , content
  } from 'csstips'

const container =
  style
  ( { position: 'relative'
    , padding: '.4em'
    , overflow: 'hidden'
    , backgroundColor: '#225'
    , height: '100%'
    }
  , vertical
  )

const head =
  style
  ( { justifyContent: 'space-between' 
    , flex: 1
    }
  , horizontal
  )

const name =
  style
  ( { fontSize: '2em'
    , color: '#bbb'
    }
  )

const copy =
  style
  ( { fontSize: '1.2em'
    , marginLeft: '4px'
    , cursor: 'pointer'
    , padding: '.4em'
    , color: 'white'
    , backgroundColor: '#44a'
    , borderRadius: '.2em'
    , boxShadow: '0 .1em .2em 0 rgba(0,0,0,.4)'
    , $nest:
      { '&:hover':
        { backgroundColor: '#66c'
        }
      }
    }
  , content
  )

const config =
  style
  ( { fontSize: '.6rem'
    , color: 'white'
    , overflowX: 'hidden'
    , overflowY: 'scroll'
    , flex: 99
    }
  )

export
  { container
  , head
  , name
  , copy
  , config
  }
