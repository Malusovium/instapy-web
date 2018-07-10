import { bot
       , err
       } from '../utils'

const logsBot =
  async (ctx:any) => {
    await bot.logs()
      .then( (logs:any) => ctx.body = { logs: logs }
      ).catch( err.handleError(ctx) )
  }

export default { get: logsBot }

