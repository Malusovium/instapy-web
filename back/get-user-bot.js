const readBotUserData = require('./src/utils').readBotUserData
const auth = require('./src/auth')

module.exports = async (ctx, next) => {
  try {
    const data = ctx.request.body.data
    if(!!data){
      const userId = await auth.authenticate(data.key)
      const acces = await auth.authorize(userId, data.botId)
      if(acces) {
        const userData = await readBotUserData(data.botId)
        ctx.body = {
          userData: {
            userName: userData.userName,
            passWord: 'woahSecret!'
          }
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

