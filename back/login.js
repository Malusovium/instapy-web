const auth = require('./src/auth')

module.exports = async (ctx, next) => {
  try {
    const data = ctx.request.body.data;
    if(!!data){
      const userInfo = await auth.login(data.userName, data.passWord)
      const key = await auth.genKey()
      await auth.addKey(userInfo.id, key)
      ctx.body = {userInfo, key}
    }else{
      throw 'The server experienced an malfuction'
    }
  }
  catch (err) {
    ctx.body = {messaga: err}
  }
}
