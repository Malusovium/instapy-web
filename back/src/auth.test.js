const auth = require('./auth')

const test = require('ava')
const expect = require('expect.js')

test(async t => {
  const login = await auth.tests.login('niels', 'n1')
  t.true(login.id === '0001')
  t.true(login.bots[0] === '0001')
  t.true(login.bots[1] === '0002')
})

test(async t => {
  const key = await auth.tests.genKey()
  t.true(key.length === 32)
})

test(async t => {
  const message = await auth.tests.addKey('0001', 'abcdef')
  t.true(message === 'Succesfull added key')
})

test(async t => {
  console.log(await auth.tests.getKeyStore)
  await auth.tests.addKey('0001', 'abcdef')
  const userId = await auth.tests.authenticate('abcdef');

  t.true(userId === '0001')
})

test(async t => {
  const authTest1 = await auth.tests.authorize('0001', '0001')
  const authTest2 = await auth.tests.authorize('0001', '0002')
  const authTest3 = await auth.tests.authorize('0001', '0003')
  const authTest4 = await auth.tests.authorize('0001', '0004')
  const authTest5 = await auth.tests.authorize('0002', '0001')
  const authTest6 = await auth.tests.authorize('0002', '0002')
  const authTest7 = await auth.tests.authorize('0002', '0003')
  const authTest8 = await auth.tests.authorize('0002', '0004')
  const authTest9 = await auth.tests.authorize('w0arw02', '0asrsar004')
  const authTest10 = await auth.tests.authorize('000sara2', '000rsar4')

  t.true(authTest1)
  t.true(authTest2)
  t.true(!authTest3)
  t.true(!authTest4)
  t.true(!authTest5)
  t.true(!authTest6)
  t.true(authTest7)
  t.true(authTest8)
  t.true(!authTest9)
  t.true(!authTest10)
})
// test(async t => {
//   const key = await auth.tests.authenticate(, )
//   t.true(key.length === 32)
// })
