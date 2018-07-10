import { _throw
       , throwWhen
       , throwWhenNot
       } from './throw'
import { exec } from 'child_process'

const PROJECT_PATH: string =
  process.env.DATA_PATH
    ? `${process.env.DATA_PATH}/InstaPy`
    : `${__dirname}/../../../data/InstaPy`

const dockerCompose =
  (...args:string[]) =>
    [ `docker-compose --file ${PROJECT_PATH}/docker-prod.yml`
    , ...args
    ].join(' ')

const wrappedExec =
  (command:string) =>
    new Promise( (res, rej) =>
      exec( command
          , (error, stdout, stderr) => {
              console.log(error, stdout, stderr)
              error || stderr
                ? rej(error ? error : new Error(stderr))
                : res(stdout)
            }
          )
    )

const catchDone =
  (err:any) =>
    err.message.includes('done')
      ? true
      : _throw(err.message)

const countIncludesReducer =
  (containString:string) =>
      (acc:number, curr:string) =>
        curr.includes(containString)
          ? acc + 1
          : acc

const convertToBotCodes =
  (ups:number, exits:number): string =>
    ups + '' + exits

const toBotStatus =
  (stdout:string):string => {
    const stdoutArr = stdout.split('\n')
    console.log(stdoutArr)
    const totalUp =
      stdoutArr.reduce(countIncludesReducer('Up'), 0)
    const totalExit =
      stdoutArr.reduce(countIncludesReducer('Exit'), 0)

    return convertToBotCodes(totalUp, totalExit)
  }

const isFirstReducer =
  (check:string) =>
    (acc:string, curr:string[]) =>
      curr[0] === check
        ? curr[1]
        : acc

const toPrettyBotStatus =
  (botStatus:string) =>
    [ [ '00', 'Not Initalised' ]
    , [ '11', 'Done' ]
    , [ '20', 'Running' ]
    , [ '02', 'Stopped' ]
    ].reduce(isFirstReducer(botStatus), '')

const botStatus =
  () =>
    wrappedExec( dockerCompose('ps') )
      .then(toBotStatus)

const status =
  () =>
    botStatus()
      .then( toPrettyBotStatus )
      .then( throwWhen( `Couldn't retrieve status!`
                      , ''
                      )
      )

const start =
  () =>
    botStatus()
      .then( throwWhen( 'Bot is already running!'
                      , '20'
                      )
      ).then( () =>
        wrappedExec( dockerCompose('up', '-d', '--build') )
      ).catch(catchDone)

const stop =
  () =>
    botStatus()
      .then( throwWhenNot( 'Bot is not running!'
                         , '20'
                         )
      ).then( () =>
        wrappedExec( dockerCompose('stop') )
      ).catch(catchDone)

const revArr =
  (arr: any[]) =>
    arr.reduce
    ( (arr, curr) => [...arr, curr], [])

const splitStringAt =
  (delimiter: string) =>
    (str: string) =>
      str.split(delimiter)

const takeLastN =
  (n: number) =>
    (arr:string[]) =>
      (arr.length <= n)
        ? arr
        : arr
            .reverse()
            .slice(0, n)
            .reverse()

const logs =
  () =>
    wrappedExec( dockerCompose('logs', 'web') )
      .then(splitStringAt('\n'))
      .then(takeLastN(30))

export const bot =
  { start
  , stop
  , status
  , logs
  }
