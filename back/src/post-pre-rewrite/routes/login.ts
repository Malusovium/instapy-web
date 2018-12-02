import { createToken } from './../manageJWT'

const login =
  async (req:any) => {
    return createToken({ id: "1" })
  }

export
  { login
  }
