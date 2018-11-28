import { promises } from 'fs'

const { readFile } = promises

const sendStatic =
  (filePath: string, encoding: string | null = 'utf8') =>
    async () =>
      readFile
      ( filePath
      , encoding
      )
      .catch
       ( (err) => {
           throw new Error(`Couldn't retrieve file`)
         }
       )

export
  { sendStatic
  }
