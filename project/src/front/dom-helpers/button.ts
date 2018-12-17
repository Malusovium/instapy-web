import { stylesheet
       , keyframes
       } from 'typestyle'
import { color
       , rgb
       } from 'csx'
import { button
       , VNode
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
    , loading:
        color(buttonColor)
          .darken(.05)
          .toRGB()
          .toString()
    }
  )

const baseButton =
  { fontSize: '1em'
  , fontWeight: 700
  , borderStyle: 'none'
  , padding: '.6rem'
  , color: 'white'
  , borderRadius: '.2rem'
  , cursor: 'pointer'
  , minHeight: '2.4em'
  , minWidth: '5em'
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

const rotateTo =
  (deg:number) => (
    { transform: `translateX(-50%) rotate(${deg}deg)` }
  )

const loadingAnimation =
  keyframes
  ( { '0%': rotateTo(0)
    , '12.5%': rotateTo(45)
    , '25%': rotateTo(90)
    , '37.5%': rotateTo(135)
    , '50%': rotateTo(180)
    , '62.5%': rotateTo(225)
    , '75%': rotateTo(270)
    , '87.5%': rotateTo(315)
    , '100%': rotateTo(360)
    }
  )

export const genStylesheet =
  (buttonColors: ButtonColors): ButtonStylesheet =>
    stylesheet
    ( { normal:
        { ...baseButton
        , position: 'relative'
        , backgroundColor: buttonColors.normal
        , ...buttonShadow(buttonColors.normal)
        , $nest:
          { ...ButtonHover(buttonColors.normal)
          , ...ButtonActive(buttonColors.normal)
          }
        }
      , disabled:
        { ...baseButton
        , position: 'relative'
        , backgroundColor: buttonColors.disabled
        , ...buttonShadow(buttonColors.disabled, true)
        , cursor: 'not-allowed'
        }
      , warning:
        { ...baseButton
        , position: 'relative'
        , backgroundColor: buttonColors.warning
        , ...buttonShadow(buttonColors.warning)
        , $nest:
          { ...ButtonHover(buttonColors.warning)
          , ...ButtonActive(buttonColors.warning)
          }
        }
      , error:
        { ...baseButton
        , position: 'relative'
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
        , cursor: 'progress'
        , overflow: 'hidden'
        , $nest:
          { '&:before':
            { content: '"_"'
            , color: 'transparent'
            }
          , '> svg':
            { position: 'absolute'
            , fill: 'white'
            , top: '9%'
            , left: '50%'
            , height: '80%'
            , animationName: loadingAnimation
            , animationDuration: '.8s'
            , animationTimingFunction: 'step-start'
            , animationIterationCount: 'infinite'
            }
          }
        }
      }
    )

const loadingIcon =
  `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M13.75 22c0 .966-.783 1.75-1.75 1.75s-1.75-.784-1.75-1.75.783-1.75 1.75-1.75 1.75.784 1.75 1.75zm-1.75-22c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zm10 10.75c.689 0 1.249.561 1.249 1.25 0 .69-.56 1.25-1.249 1.25-.69 0-1.249-.559-1.249-1.25 0-.689.559-1.25 1.249-1.25zm-22 1.25c0 1.105.896 2 2 2s2-.895 2-2c0-1.104-.896-2-2-2s-2 .896-2 2zm19-8c.551 0 1 .449 1 1 0 .553-.449 1.002-1 1-.551 0-1-.447-1-.998 0-.553.449-1.002 1-1.002zm0 13.5c.828 0 1.5.672 1.5 1.5s-.672 1.501-1.502 1.5c-.826 0-1.498-.671-1.498-1.499 0-.829.672-1.501 1.5-1.501zm-14-14.5c1.104 0 2 .896 2 2s-.896 2-2.001 2c-1.103 0-1.999-.895-1.999-2s.896-2 2-2zm0 14c1.104 0 2 .896 2 2s-.896 2-2.001 2c-1.103 0-1.999-.895-1.999-2s.896-2 2-2z"/></svg>
  `

export const genButton =
  (css: ButtonStylesheet) =>
    (buttonState: ButtonState, inner: VNode | string, selector = '') =>
      button
      ( `.${css[buttonState]} ${selector}`
      , buttonState === 'loading'
          ? { props: { innerHTML: loadingIcon } }
          : inner
      )

export const Button =
  (buttonColor:string) =>
    genButton
    ( genStylesheet
      ( genButtonColors
        (buttonColor)
      )
    )

