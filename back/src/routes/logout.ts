import { _db } from '../utils'

const emptyJwtKey =
  () =>
    _db
      .then( (db:any) =>
        db.set('jwtKey', '')
          .write()
      )

const logOut =
  async (ctx:any) => {
    await emptyJwtKey()
      .then( () =>
        ctx.body = { succes: true }
      )
  }

export default { get: logOut }
