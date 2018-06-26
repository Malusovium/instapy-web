import { bot
      , err
      } from '../utils'

const stopBot =
  async (ctx:any) => {
    await bot.stop()
      .then( () => ctx.body = { succes: true }
      ).catch( err.handleError(ctx) )
  }

export default { get: stopBot}
