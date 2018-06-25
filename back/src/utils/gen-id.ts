// Going lisping
export const genId =
  ():string =>
    ( (Date.now() % 100000).toString(26) )
    + ( (Date.now() * 3).toString(26) )
    + ( Date.now().toString(26) )
