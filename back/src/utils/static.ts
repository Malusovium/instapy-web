import { promises } from 'fs'

const { readFile } = promises

// not safe file sending
const sendStatic =
  (filePath: string) =>
    async () =>
      readFile
      ( filePath
      , 'utf8'
      )
      .catch
       ( (err) => {
           throw new Error(`Couldn't retrieve file`)
         }
       )

export
  { sendStatic
  }
