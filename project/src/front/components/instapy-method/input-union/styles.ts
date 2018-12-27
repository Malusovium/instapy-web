// styles
import { style} from 'typestyle'
import { vertical } from 'csstips'

const container =
  style
  ( { fontSize: '1em'
    , backgroundColor: '#eee'
    , borderTopStyle: 'solid'
    , borderTopColor: 'rgba(0,0,0,.6)'
    , borderTopWidth: '.1em'
    , overflow: 'hidden'
    , paddingBottom: '.2em'
    }
  , vertical
  )

const name =
  style
  ( { fontSize: '1.2em'
    , cursor: 'pointer'
    , background: '#bbb'
    , color: 'white'
    , padding: '.2em'
    , marginBottom: '.2em'
    }
  )

const hidden =
  style
  ( { display: 'none'
    }
  )

const included =
  style
  ( { background: '#6c6' }
  )

const childWrapper =
  style
  ( { color: '#444'
    }
  )

const pickListWrapper =
  style
  ( {}
  )

const pickWrapper =
  style
  ( { position: 'relative'
    }
  )

const pick =
  style
  ( { position: 'absolute'
    , cursor: 'pointer'
    , top: 0
    , bottom: 0
    , left: 0
    , right: 0
    , background: '#ccc2'
    , $nest:
      { '&:hover':
        { background: '#ccc8'
        }
      }
    }
  )

const open =
  style
  ( { transform: 'rotateX(180deg)'
    , fontSize: '1em'
    , cursor: 'pointer'
    , padding: '.4em'
    , textAlign: 'center'
    , background: '#555'
    , color: 'white'
    , $nest:
      { '&:hover':
        { background: 'rgba(200, 200, 200, 0.05)'
        }
      , '> i':
        { fontSize: '.8em !important'
        }
      }
    }
  )

export
  { container
  , name
  , childWrapper
  , pickListWrapper
  , hidden
  , included
  , pick
  , pickWrapper
  , open
  }
