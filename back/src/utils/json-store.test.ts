import { jsonStore
       } from './store'

const USER_FILE_PATH =
  process.env.DATA_PATH
    ? process.env.DATA_PATH
    : './../../../data'

const defaultUser =
  { userName: 'default'
  , passWord: 'defaultPass'
  }
const userStore = jsonStore (USER_FILE_PATH, true) ('user', {})

userStore.watch(console.log)

type User =
  { userName: string
  , passWord: string
  }
userStore.get()
  .then(console.log)
// userStore.set<User>({ userName: 'my username', passWord: 'my-password'})
// userStore.set({ userName: 'new my username' })
// userStore.set({ userName: 'new new my username'})
