const getUsersFile = require('./utils').readUsersFile

const genAlfLower = 'abcdefghijklmnopqrstuvwxyz'
const genAlfUpper = 'ABCDEFGHIJKLMNOPQRSTYVWXYZ'
const genNum = '0123456789'

const genString = genAlfLower + genAlfUpper + genNum

let keyStore = [
  {},
  { id: '0001',
    key: ''},
  {id: '0002',
    key: ''},
]

// let authorization = [
//   {},
//   {
//     id: '0001',
//     bots: [
//       '0001',
//       '0002',
//     ]
//   },
//   {
//     id: '0002',
//     bots: [
//       '0003',
//       '0004',
//     ]
//   }
// ]
const getKeyStore = async () => keyStore

const authorize = async (userId, botId) => {
  const auth1 = (userId === '0001')
    ? (botId === '0001' || botId === '0002') ? true : false
    : false

  const auth2 = (userId === '0002')
    ? (botId === '0003' || botId === '0004') ? true : false
    : false

  console.log(auth1, auth2)

  return auth1 || auth2
}

const authenticate = async (key) => {
  const user = keyStore
    .filter(user => user.key === key)
    .map(user => user.id)

  if(!user[0]){
    throw 'Wrong key'
  }

  return user[0]
}

const addKey = async (id, key) => {
  const keyIndex = await keyStore
    .map((user, index) => user.id === id ? index : '')
    .filter(index => !!index)

  console.log(keyIndex, keyIndex[0])
  if(!keyIndex[0]){
    throw 'No user id found'
  }
  keyStore[keyIndex].key = key

  console.log(keyStore)

  return 'Succesfull added key'
}

const genKey = async (length = 32, acc = '') => {
  if(length === 0) {
    console.log(acc)
    return acc
  }
  const randNum = Math.round(Math.random() * (genString.length - 1))
  const randChar = genString.charAt(randNum)

  console.log(
    randNum,
    randChar,
  )

  return await genKey(length - 1, randChar + acc)
}

const login = async (userName, passWord) => {
  const users = await getUsersFile()
  const user = await users
    .filter(s => {
      const checkUser = s.userName === userName
      const checkPass = s.passWord === passWord

      return (checkUser && checkPass)
    })[0]

  if(!user)
    throw 'Login credentials incorrect'
  // console.log(users)
  // console.log(user)
  return {
    id: user.id,
    bots: user.bots,
  }
}

module.exports = {
  authenticate,
  login,
  genKey,
  addKey,
  authorize,
  tests: {
    authorize,
    getKeyStore,
    addKey,
    authenticate,
    login,
    genKey,
  }
}
