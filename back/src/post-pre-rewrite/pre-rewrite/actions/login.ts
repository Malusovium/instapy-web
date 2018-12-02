import xs, { Stream } from 'xstream'

type UserCredentials =
  { userName: string
  , passWord: string
  }

type LoginMessage =
  { _name: 'LOGIN'
  , _data:
    { userName: string
    , passWord: string
    }
  }

type JWT_KEY = string

type Login =
  ( loginMessage$: Stream<LoginMessage>
  , userCredentials$: Stream<UserCredentials>
  ) => JWT_KEY

const login: Login =
  (loginMessage$, userCredentials$) => {
    return ''
  }
