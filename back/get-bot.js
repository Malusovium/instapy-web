// const initNewBot = require('./src/utils').initNewBot
// const generateConfig = require('./src/utils').generateConfig
// const creatBotFile = require('./src/utils').creatBotFile
// const saveBotConfig = require('./src/utils').saveBotConfig
const readBotConfig = require('./src/utils').readBotConfig
const auth = require('./src/auth')

module.exports = async (ctx, next) => {
  try {
    const data = ctx.request.body.data;
    if(!!data){
      const userId = await auth.authenticate(data.key)
      const acces = await auth.authorize(userId, data.botId)
      if(acces) {
        const botConfig = await readBotConfig(data.botId)
        ctx.body = {
          botConfig
        }
      }
      else{
        throw 'No auth'
      }
    }else{
      throw 'The server experienced an malfuction'
    }
  }
  catch (err) {
    ctx.body = {messaga: err}
  }
}
