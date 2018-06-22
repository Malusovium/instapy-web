const initNewBot = require('./src/utils').initNewBot
const generateConfig = require('./src/utils').generateConfig
const creatBotFile = require('./src/utils').creatBotFile
const saveBotConfig = require('./src/utils').saveBotConfig
const readBotUserData = require('./src/utils').readBotUserData
const auth = require('./src/auth')

module.exports = async (ctx, next) => {
  try {
    const data = ctx.request.body.data
    if(!!data){
      const userId = await auth.authenticate(data.key)
      const acces = await auth.authorize(userId, data.botId)
      if(acces) {
        await initNewBot(data.botId)
        const userData = await readBotUserData(data.botId)
        const config = await generateConfig(data.botConfig, userData)
        const botFile = await creatBotFile(data.botId, config)
        const saveBot = await saveBotConfig(data.botId, data.botConfig)
        ctx.body = {
          action: saveBot
        }
      }else{
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
