import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'

const login =
  (ctx:any) => {
    const data = ctx.request.body.data
    const userName = data.userName
    const passWord = data.passWord
    ctx.body =
      [ 'Username: '
      , userName
      , ''
      , 'Password: '
      , passWord
      ].join('\n')
  }

export default { post: login }

