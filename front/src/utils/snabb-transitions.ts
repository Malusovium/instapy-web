import { equals
       , pluck
       , zipObj
       , reject
       } from 'rambda'

export const bezier4 = (n1:number, n2:number, n3:number, n4:number) =>
  `cubic-bezier(${n1}, ${n2}, ${n3}, ${n4})`

export const eases =
  { backward: bezier4(.68,-0.55,.27,1.55)
  }

export type Transition =
  { property: string
  , duration: number
  , delay: number
  , timing: string

  , initial: string
  , delayed: false | string
  , destroy: false | string
  }

export const transition =
  ( prop :string
  , dur = 0.4
  , delay = 0
  , timing = 'linear'
  ) =>
    ( init: string
    , { add = false
      , rem = false
      }: { add?: false | string
         , rem?: false | string
         }
    ): Transition => (
      { property: prop
      , duration: dur
      , delay: delay
      , timing: timing

      , initial: init
      , delayed: add
      , destroy: rem
      }
    )

type AnimateableProperties =
  { background?: string
  , backgroundColor?: string
  , backgroundPosition?: string
  , backgroundSize?: string
  , border?: string
  , borderBottom?: string
  , borderBottomColor?: string
  , borderBottomLeftRadius?: string
  , borderBottomRightRadius?: string
  , borderBottomWidth?: string
  , borderColor?: string
  , borderLeft?: string
  , borderLeftColor?: string
  , borderLeftWidth?: string
  , borderRadius?: string
  , borderRight?: string
  , borderRightColor?: string
  , borderRightWidth?: string
  , borderTop?: string
  , borderTopColor?: string
  , borderTopLeftRadius?: string
  , borderTopRightRadius?: string
  , borderTopWidth?: string
  , borderWidth?: string
  , bottom?: string
  , boxShadow?: string
  , caretColor?: string
  , clip?: string
  , clipPath?: string
  , color?: string
  , columnCount?: string
  , columnGap?: string
  , columnRule?: string
  , columnRuleColor?: string
  , columnRuleWidth?: string
  , columnWidth?: string
  , columns?: string
  , filter?: string
  , flex?: string
  , flexBasis?: string
  , flexGrow?: string
  , flexShrink?: string
  , font?: string
  , fontSize?: string
  , fontSizeAdjust?: string
  , fontStetch?: string
  , fontVariationSettin?: string
  , fontWeight?: string
  , gap?: string
  , gridColumnGap?: string
  , gridGap?: string
  , gridRowGap?: string
  , height?: string
  , left?: string
  , letterSpacing?: string
  , lineClamp?: string
  , lineHeight?: string
  , margin?: string
  , marginBottom?: string
  , marginLeft?: string
  , marginRight?: string
  , marginTop?: string
  , mask?: string
  , maskBorder?: string
  , maskPosition?: string
  , maskSize?: string
  , maxHeight?: string
  , maxLines?: string
  , maxWidth?: string
  , minHeight?: string
  , minWidth?: string
  , objectPosition?: string
  , offset?: string
  , offsetAnchor?: string
  , offsetDistance?: string
  , offsetPath?: string
  , offsetPosition?: string
  , offsetRotate?: string
  , opacity?: string
  , order?: string
  , outline?: string
  , outlineColor?: string
  , outlineOffset?: string
  , outlineWidth?: string
  , padding?: string
  , paddingBottom?: string
  , paddingLeft?: string
  , paddingRight?: string
  , paddingTop?: string
  , perspective?: string
  , perspectiveOrigin?: string
  , right?: string
  , rotate?: string
  , rowGap?: string
  , scale?: string
  , scrollSnapCoordinate?: string
  , scrollSnapDestination?: string
  , shapeImageThreshold?: string
  , shapeMargin?: string
  , shapeOutside?: string
  , tabSize?: string
  , textDecoration?: string
  , textDecorationColor?: string
  , textEmphasis?: string
  , textEmphasisColor?: string
  , textIndent?: string
  , textShadow?: string
  , top?: string
  , transform?: string
  , transformOrigin?: string
  , translate?: string
  , verticalAlign?: string
  , visibility?: string
  , width?: string
  , wordSpacing?: string
  , zIndex?: string
  , zoom?: string
  }

export type SnabbTransition =
  { transitionProperty: string
  , transitionDuration: string
  , transitionTimingFunction: string
  , transitionDelay: string

  , delayed?: object
  , destroy?: object
  } & AnimateableProperties

const transitionVal =
  (prop:string, affix = '') =>
    (objList:Transition[]): string =>
      pluck(prop, objList)
        .map( (str:string) => str + affix)
        .join(', ')

const transProperty = transitionVal('property')
const transDuration = transitionVal('duration', 's')
const transTiming = transitionVal('timing')
const transDelay = transitionVal('delay', 's')

const pluckZip =
  (keyPluck:string, valuePluck:string, objList: Object[]) =>
    zipObj
    ( pluck(keyPluck, objList)
    , pluck(valuePluck, objList)
    )

const initProps =
  (objList: Transition[]): AnimateableProperties =>
    pluckZip('property', 'initial', objList)

const delayedProps =
  (objList: Transition[]): AnimateableProperties =>
    pluckZip
    ( 'property'
    , 'delayed'
    , reject
      ( ({ delayed }: Transition) => delayed === false
      , objList
      )
    )

const destroyProps =
  (objList: Transition[]): AnimateableProperties =>
    pluckZip
    ( 'property'
    , 'destroy'
    , reject
      ( ({ destroy }: Transition) => destroy === false
      , objList
      )
    )

export const snabbTransition =
  (transitions:Transition[]): SnabbTransition => (
    { transitionProperty: transProperty(transitions)
    , transitionDuration: transDuration(transitions)
    , transitionTimingFunction: transTiming(transitions)
    , transitionDelay: transDelay(transitions)

    , ...(initProps(transitions))
    , delayed: delayedProps(transitions)
    , destroy: destroyProps(transitions)
    }
  )
