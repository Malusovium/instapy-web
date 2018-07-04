import { stylesheet
       , keyframes
       } from 'typestyle'
import { color
       , rgb
       } from 'csx'
import { button
       } from '@cycle/dom'

export type ButtonState =
  'normal'
  | 'disabled'
  | 'warning'
  | 'error'
  | 'loading'

export type ButtonStylesheet =
  { normal: string
  , disabled: string
  , warning: string
  , error: string
  , loading: string
  }

type ButtonColors =
  { normal: string
  , disabled: string
  , warning: string
  , error: string
  , loading: string
  }

export const genButtonColors =
  (buttonColor: string): ButtonColors => (
    { normal: buttonColor
    , disabled:
        color(buttonColor)
          .grayscale()
          .toRGB()
          .toString()
    , warning:
        color(buttonColor)
          .mix(rgb(255, 255, 0), 0.1)
          .darken(.1)
          .toRGB()
          .toString()
    , error:
        color(buttonColor)
          .mix(rgb(255, 0, 0), 0.1)
          .toRGB()
          .toString()
    , loading: buttonColor
    }
  )

const baseButton =
  { fontSize: '1rem'
  // , position: 'relative'
  , borderStyle: 'none'
  , padding: '.6rem'
  , color: 'white'
  , borderRadius: '.2rem'
  , cursor: 'pointer'
  , minHeight: '2.4rem'
  , minWidth: '5rem'


  // remove late
  , margin: '.8rem'
  }

const buttonShadow =
  (buttonColor:string, pushed = false) => (
    { boxShadow:
        ( pushed
            ? '0 0 0 .05rem '
            : '0 .1rem 0 .05rem '
        ) + color(buttonColor)
          .darken(.3)
          .toRGB()
          .toString()
    }
  )

const ButtonHover =
  (buttonColor: string) => (
    { '&:hover':
      { backgroundColor:
          color(buttonColor)
            .lighten(.06)
            .toString()
      }
    }
  )
const ButtonActive =
  (buttonColor: string) => (
    { '&:active':
      { backgroundColor:
          color(buttonColor)
            .lighten(.06)
            .toString()
      , ...buttonShadow(buttonColor, true)
      , transform:
          'translateY(.1rem)'
      }
    }
  )

const loadingAnimation =
  keyframes
  ( { '0%': { left: '-.4rem' }
    , '100%': { left: '.7rem' }
    }
  )

export const genStylesheet =
  (buttonColors: ButtonColors): ButtonStylesheet =>
    stylesheet
    ( { normal:
        { ...baseButton
        , backgroundColor: buttonColors.normal
        , ...buttonShadow(buttonColors.normal)
        , $nest:
          { ...ButtonHover(buttonColors.normal)
          , ...ButtonActive(buttonColors.normal)
          }
        }
      , disabled:
        { ...baseButton
        , backgroundColor: buttonColors.disabled
        , ...buttonShadow(buttonColors.disabled, true)
        , cursor: 'not-allowed'
        }
      , warning:
        { ...baseButton
        , backgroundColor: buttonColors.warning
        , ...buttonShadow(buttonColors.warning)
        , $nest:
          { ...ButtonHover(buttonColors.warning)
          , ...ButtonActive(buttonColors.warning)
          }
        }
      , error:
        { ...baseButton
        , backgroundColor: buttonColors.error
        , ...buttonShadow(buttonColors.error)
        , $nest:
          { ...ButtonHover(buttonColors.error)
          , ...ButtonActive(buttonColors.error)
          }
        }
      , loading:
        { ...baseButton
        , position: 'relative'
        , backgroundColor: buttonColors.loading
        , ...buttonShadow(buttonColors.loading, true)
        , transform: 'translateY(-.2rem)'
        , cursor: 'progress'
        , overflow: 'hidden'
        , $nest:
          { '> svg':
            { position: 'absolute'
            , fill: 'white'
            , transform: 'scaleX(1.4)'
            , top: '-1.3rem'
            , left: '-.4rem'
            , width: '5rem'
            , animationName: loadingAnimation
            , animationDuration: '.5s'
            , animationTimingFunction: 'linear'
            , animationIterationCount: 'infinite'
            }
          }
        }
      }
    )

const loadingIcon =
  `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.47 15h-2.106l4.95-6h2.107l-4.951 6zm1.197-6h-2.11l-4.951 6h2.109l4.952-6zm-3.758 0h-2.055l-4.952 6h2.057l4.95-6zm-5.813 0l-4.096 4.963v1.037h1.254l4.951-6h-2.109zm17.483 6h2.421v-2.934l-2.421 2.934zm-19.131-6h-2.448v2.967l2.448-2.967zm21.552 1.069v-1.069h-1.232l-4.95 6h2.113l4.069-4.931zm-2.879-1.069h-2.052l-4.952 6h2.052l4.952-6z"/></svg>
  `

export const genButton =
  (css: ButtonStylesheet) =>
    (buttonState: ButtonState, text = '') =>
      button
      ( `.${css[buttonState]}`
      , buttonState === 'loading'
          ? { props: { innerHTML: loadingIcon } }
          : buttonState
      )
