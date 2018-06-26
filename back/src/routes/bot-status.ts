import { bot
       , err
       } from '../utils'

const statusBot =
  async (ctx:any) => {
    await bot.status()
      .then( (ps:any) => ctx.body = { status: ps }
      ).catch( err.handleError(ctx) )
  }

export default { get: statusBot }
