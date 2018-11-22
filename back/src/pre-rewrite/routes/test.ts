import { _db } from '../utils'

const test =
  async (ctx:any) => {

    await _db
      .then( (db:any) =>
        db.getState()
      ).then( (state:any) =>
        ctx.body =
          { dbState: state }
      )
  }

export default { get: test }
