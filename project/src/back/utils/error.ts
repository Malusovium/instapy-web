type ConditionFn = (value: any) => boolean

type ThrowAt =
  (message: string) =>
    (conditionfn: ConditionFn) =>
      (value:any) =>
        Promise<any>

const throwAt: ThrowAt =
  (message) =>
    (conditionFn) =>
      (value) =>
        conditionFn(value)
          ? Promise.reject(new Error(message))
          : Promise.resolve(value)

export
  { throwAt
  }
