import {Stream} from 'xstream'

type BaseMessage =
  { TYPE: string
  }

type IsType =
  (actionType: string) => <T>(action: BaseMessage & T ) => boolean
const isType: IsType =
  (actionType) =>
    (action) =>
      actionType === action.TYPE

type OnlyAction =
  (actionType: string) =>
    (action$: Stream<any>) =>
      Stream<any>
const onlyAction: OnlyAction =
  (actionType) =>
    (action$) =>
      action$
        .filter(isType(actionType))

export
  { onlyAction
  }
