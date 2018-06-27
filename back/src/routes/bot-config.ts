import { _db } from '../utils'

const getConfig =
  async (ctx:any) =>
    _db
      .then( (db:any) =>
        db.get('botConfig')
          .value()
      ).then( (config:any[]) =>
        ctx.body = { config }
      )

const validatConfig =
  async (config:any) => {
    // validation rules
    return false
  }

const saveConfig =
  async (config:any) =>
    _db
      .then( (db:any) =>
        db.set('botConfig', config)
          .write()
      )

const postConfig =
  async (ctx:any) => {
    const { config } = ctx.request.body.data

    await validatConfig(config)
      .then(saveConfig)
  }

export default { get: getConfig, post: postConfig }
