const fs = require('fs')

const { hashSync, compareSync } = require('bcrypt')

const SALT_ROUNDS = 10
const GENERATED_HASHES_PATH = './bcrypt-hashes.json'

const proposedObject =
  { pass: ''
  , passHash: ''
  }

const passwordList =
  [ 'myPass1'
  , 'myPass2'
  , 'myPass3'
  , 'with spaces'
  , 'With a capital'
  , 'With Numbers 123456789'
  , '~~@!#!$@@#@$@'
  ]

const generatedPasswordList = 
  passwordList
    .map( (pass) => (
            { pass: pass
            , hash: hashSync(pass, SALT_ROUNDS)
            , secondHash: hashSync(pass, SALT_ROUNDS)
            }
          )
        )
    .map( ({pass, hash, secondHash}) => (
            { pass
            , hash
            // , secondHash
            // , same: compareSync(pass, secondHash)
            }
          )
        )

const passwordListJSON =
  JSON.stringify(generatedPasswordList, null, '\t')

fs.writeFileSync(GENERATED_HASHES_PATH, passwordListJSON)
