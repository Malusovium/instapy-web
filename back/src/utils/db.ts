import * as low from 'lowdb'
import * as FileAsync from 'lowdb/adapters/FileAsync'
import * as Memory from 'lowdb/adapters/Memory'
import { initBcrypt } from './bcrypt'

const { createHash } = initBcrypt(10)

const initState =
  createHash(process.env.PASS_WORD || 'pass')
    .then( (hashPass:string) => (
        { userName: process.env.USER_NAME || 'user'
        , passWord: hashPass
        , jwtKey: ''
        }
      )
    )

const dbPath =
  process.env.DATA_PATH
    ? `${process.env.DATA_PATH}/db.json`
    : `${__dirname}/../../../data/db.json`

const productionLow =
  (defaultState:any) =>
    new Promise( (res, rej) =>
      low(new FileAsync(dbPath))
        .then( (db:any) => {
            db.defaults(defaultState).write()
              .then( () => res(db))
          }
        )
    )

const inMemoryLow =
  (defaultState:any) =>
    Promise.resolve(low(new Memory('')))
      .then( (db:any) => {
        db.defaults(defaultState).write()
        return db
      })

const lowdb =
  (defaultState:any) =>
    process.env.NODE_ENV === 'production'
      ? productionLow(defaultState)
      : inMemoryLow(defaultState)

export const _db =
  initState
    .then(lowdb)
  // ).catch( (err:any) => console.log(err))
