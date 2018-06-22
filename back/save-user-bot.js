const saveBotUserData = require('./src/utils').saveBotUserData
const auth = require('./src/auth')

module.exports = async (ctx, next) => {
  try {
    const data = ctx.request.body.data
    if(!!data){
      const userId = await auth.authenticate(data.key)
      const acces = await auth.authorize(userId, data.botId)
      if(acces) {
        const saveUser = await saveBotUserData(data.botId, data.userData)
        ctx.body = {
          action: saveUser
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

