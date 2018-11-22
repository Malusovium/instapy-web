import { bot
      , err
      } from '../utils'

const startBot =
  async (ctx:any) => {
    await bot.start()
      .then( () => ctx.body = { succes: true }
      ).catch( err.handleError(ctx) )
  }

export default { get: startBot}

