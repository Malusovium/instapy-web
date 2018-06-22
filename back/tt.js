'use strict'

const auth = require('./src/auth')
const utils = require('./src/utils')

// const genKey = async (length = 20, acc = '') => {
//   if(length === 0) {
//     console.log(acc)
//     return acc
//   }
//   const randNum = Math.round(Math.random() * genString.length)
//   const randChar = genString.charAt(randNum)
//
//   console.log(
//     randNum,
//     randChar,
//   )
//
//   return await genKey(length - 1, randChar + acc)
// }
function fac(n) {
  if(n === 0){
    return 0
  }
  else{
    return n + fac(n - 1)
  }
}

function tailFac(n, acc = 0) {
  if(n === 0){
    return acc
  }
  else{
    return tailFac(n - 1, n + acc)
  }
}
// console.log(fac(100000))
console.log(tailFac(100000))

// auth.tests.genKey(4096)
//   .then(s => console.log(s))
// exec(`rm ${dataPath}/bot${num}/docker_quickstart.py`)

// utils.tests.initNewBot(1)
// .then( (res) => console.log(res))
// utils.tests.generateConfig({userName: 'replace', passWord: 'repPass'})

// const config = {
//   userName: 'test',
//   passWord: 'tpass',
//   settings: {
//     sleepReduce: {
//       percentage: 40
//     },
//     doComment: {
//      enabled: 'True',
//      percentage: 10
//     },
//     comments: {
//       arr: ['cool!', 'nice!'],
//       media: 'Photo'
//     },
//     doFollow: {
//       enabled: 'True',
//       percentage: 20,
//       times: 2
//     },
//     ignoreUsers: {
//       arr: ['friend1', 'friend2']
//     },
//     dontLike: {
//       arr: ['cat', '[pet']
//     },
//     ignoreIfContains: {
//       arr: ['cat', '[pet']
//     },
//     dontInclude: {
//       arr: ['cat', '[pet']
//     },
//     userInteract: {
//       amount: 100,
//       randomize: 'True',
//       percentage: 20,
//       media: 'Photo'
//     }
//   },
//   commands: {
//     likeByTags: {
//       arr: ['cat', 'mule'],
//       amount: 10,
//       media: 'Video'
//     },
//     likeFromImage: {
//       url: 'www.instagram.com/cat2324',
//       amount: 10
//     },
//     likeByFeed: {
//       amount: 10,
//       randomize: 'True',
//       unfollow: 'True',
//       interact: 'True'
//     },
//     followByList: {
//       arr: ['friend1', 'friend2'],
//       times: 3
//     },
//     followUserFollowers: {
//       arr: ['friend1', 'friend2'],
//       amount: 100,
//       random: 'True',
//       interact: 'True',
//       sleepDelay: 600
//     },
//     interactUserFollowers: {
//       arr: ['friend1', 'friend2'],
//       amount: 30,
//       random: 'True'
//     },
//     interactUserFollowing: {
//       arr: ['friend1', 'friend2'],
//       amount: 50,
//       random: 'True'
//     },
//     followUserFollowing: {
//       arr: ['friend1', 'friend2'],
//       amount: 50,
//       random: 'True',
//       interact: 'True',
//       sleepDelay: 600
//     },
//     unfollowUsers: {
//       amount: 40,
//       onlyInstaPyFollowed: 'True',
//       onlyInstapyMethod: 'FIFO'
//     }
//   }
// }
// utils.tests.generateConfig(config)
// .then( output => console.log(output) )
