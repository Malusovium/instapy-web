const utils = require('./utils.js')

const test = require('ava')
const expect = require('expect.js')

test(async t => {
  const users = await utils.tests.readUsersFile()
  t.true(users[0].id === '0001', 'The first user has the correct id')
})

test('genCodeLine - arr', async t => {
  const name = 'set_test'
  const obj = {
    arr: ['f1', 'f2', 'f3', 'f4']
  }
  const line = await utils.tests.genCodeLine(name, obj)
  t.true(line === "bot.set_test(['f1', 'f2', 'f3', 'f4'])")
})

test('genCodeLine - usernames', async t => {
  const name = 'set_test'
  const obj = {
    usernames: ['f1', 'f2', 'f3', 'f4']
  }
  const line = await utils.tests.genCodeLine(name, obj)
  t.true(line === "bot.set_test(usernames=['f1', 'f2', 'f3', 'f4'])")
})

test('genCodeLine - url', async t => {
  const name = 'set_test'
  const obj = {
    url: 'www.instagram.com/test-img'
  }
  const line = await utils.tests.genCodeLine(name, obj)
  t.true(line === "bot.set_test(url='www.instagram.com/test-img')")
})

test('genCodeLine - amount', async t => {
  const name = 'set_test'
  const obj = {
    amount: 232
  }
  const line = await utils.tests.genCodeLine(name, obj)
  t.true(line === "bot.set_test(amount=232)")
})

test('genCodeLine - enabled', async t => {
  const name = 'set_test'
  const obj = {
    enabled: 'True'
  }
  const line = await utils.tests.genCodeLine(name, obj)
  t.true(line === "bot.set_test(enabled=True)")
})

test('genCodeLine - random', async t => {
  const name = 'set_test'
  const obj = {
    random: 'True'
  }
  const line = await utils.tests.genCodeLine(name, obj)
  t.true(line === "bot.set_test(random=True)")
})

test('genCodeLine - randomize', async t => {
  const name = 'set_test'
  const obj = {
    randomize: 'True'
  }
  const line = await utils.tests.genCodeLine(name, obj)
  t.true(line === "bot.set_test(randomize=True)")
})

test('genCodeLine - percentage', async t => {
  const name = 'set_test'
  const obj = {
    percentage: 13
  }
  const line = await utils.tests.genCodeLine(name, obj)
  t.true(line === "bot.set_test(percentage=13)")
})

test('genCodeLine - media', async t => {
  const name = 'set_test'
  const obj = {
    media: 'Photo'
  }
  const line = await utils.tests.genCodeLine(name, obj)
  t.true(line === "bot.set_test(media='Photo')")
})

test('genCodeLine - times', async t => {
  const name = 'set_test'
  const obj = {
    times: 2
  }
  const line = await utils.tests.genCodeLine(name, obj)
  t.true(line === "bot.set_test(times=2)")
})

test('genCodeLine - interact', async t => {
  const name = 'set_test'
  const obj = {
    interact: 'True'
  }
  const line = await utils.tests.genCodeLine(name, obj)
  t.true(line === "bot.set_test(interact=True)")
})

test('genCodeLine - unfollow', async t => {
  const name = 'set_test'
  const obj = {
    unfollow: 'False'
  }
  const line = await utils.tests.genCodeLine(name, obj)
  t.true(line === "bot.set_test(unfollow=False)")
})

test('genCodeLine - onlyInstaPyFollowed', async t => {
  const name = 'set_test'
  const obj = {
    onlyInstaPyFollowed: 'True'
  }
  const line = await utils.tests.genCodeLine(name, obj)
  t.true(line === "bot.set_test(onlyInstaPyFollowed=True)")
})

test('genCodeLine - onlyInstaPyMethod', async t => {
  const name = 'set_test'
  const obj = {
    onlyInstaPyMethod: 'FIFO'
  }
  const line = await utils.tests.genCodeLine(name, obj)
  t.true(line === "bot.set_test(onlyInstaPyMethod='FIFO')")
})

test('genCodeLine - sleepDelay', async t => {
  const name = 'set_test'
  const obj = {
    sleepDelay: 69
  }
  const line = await utils.tests.genCodeLine(name, obj)
  t.true(line === "bot.set_test(sleep_delay=69)")
})

test('generateConfig all', async t => {
  const config = {
    userName: 'test',
    passWord: 'tpass',
    settings: {
      sleepReduce: {
        percentage: 40
      },
      doComment: {
       enabled: 'True',
       percentage: 10
      },
      comments: {
        arr: ['cool!', 'nice!'],
        media: 'Photo'
      },
      doFollow: {
        enabled: 'True',
        percentage: 20,
        times: 2
      },
      ignoreUsers: {
        arr: ['friend1', 'friend2']
      },
      dontLike: {
        arr: ['cat', '[pet']
      },
      ignoreIfContains: {
        arr: ['cat', '[pet']
      },
      dontInclude: {
        arr: ['cat', '[pet']
      },
      userInteract: {
        amount: 100,
        randomize: 'True',
        percentage: 20,
        media: 'Photo'
      },
      upperFollowerCount: {
        limit: 1
      },
      lowerFollowerCount: {
        limit: 1
      }
    },
    commands: {
      likeByTags: {
        arr: ['cat', 'mule'],
        amount: 10,
        media: 'Video'
      },
      likeFromImage: {
        url: 'www.instagram.com/cat2324',
        amount: 10
      },
      likeByFeed: {
        amount: 10,
        randomize: 'True',
        unfollow: 'True',
        interact: 'True'
      },
      followByList: {
        arr: ['friend1', 'friend2'],
        times: 3
      },
      followUserFollowers: {
        arr: ['friend1', 'friend2'],
        amount: 100,
        random: 'True',
        interact: 'True',
        sleepDelay: 600
      },
      interactUserFollowers: {
        arr: ['friend1', 'friend2'],
        amount: 30,
        random: 'True'
      },
      interactUserFollowing: {
        arr: ['friend1', 'friend2'],
        amount: 50,
        random: 'True'
      },
      followUserFollowing: {
        arr: ['friend1', 'friend2'],
        amount: 50,
        random: 'True',
        interact: 'True',
        sleepDelay: 600
      },
      unfollowUsers: {
        amount: 40,
        onlyInstaPyFollowed: 'True',
        onlyInstapyMethod: 'FIFO'
      }
    }
  }
  const pyConfig = await utils.tests.generateConfig(config)

  t.true(pyConfig === `from instapy import InstaPy\n\nbot = InstaPy(username='test', password='tpass', selenium_local_session=False)\nbot.login()\nbot.set_selenium_remote_session(selenium_url='http://selenium:4444/wd/hub')\nbot.set_sleep_reduce(percentage=40)\nbot.set_do_comment(enabled=True, percentage=10)\nbot.set_comments(['cool!', 'nice!'], media='Photo')\nbot.set_do_follow(enabled=True, percentage=20, times=2)\nbot.set_ignore_users(['friend1', 'friend2'])\nbot.set_dont_like(['cat', '[pet'])\nbot.set_ignore_if_contains(['cat', '[pet'])\nbot.set_dont_include(['cat', '[pet'])\nbot.set_user_interact(amount=100, randomize=True, percentage=20, media='Photo')\nbot.set_upper_follower_count(limit=1)\nbot.set_lower_follower_count(limit=1)\nbot.like_by_tags(['cat', 'mule'], amount=10, media='Video')\nbot.like_from_image(url='www.instagram.com/cat2324', amount=10)\nbot.like_by_feed(amount=10, randomize=True, interact=True, unfollow=True)\nbot.follow_by_list(['friend1', 'friend2'], times=3)\nbot.follow_user_followers(['friend1', 'friend2'], amount=100, random=True, interact=True, sleep_delay=600)\nbot.interact_user_followers(['friend1', 'friend2'], amount=30, random=True)\nbot.interact_user_following(['friend1', 'friend2'], amount=50, random=True)\nbot.follow_user_following(['friend1', 'friend2'], amount=50, random=True, interact=True, sleep_delay=600)\nbot.unfollow_users(amount=40, onlyInstaPyFollowed=True)\nbot.end()\n`)
})
// test(async t => {
//   const obj = {
//     arr: ['f1', 'f2', 'f3', 'f4'],
//     media: "Photo"
//   };
//   const line = await utils.tests.setComments(obj)
//   console.log(line)
//   t.true(line === "bot.set_comments(['f1', 'f2', 'f3', 'f4'], media='Photo')",
//   'setComments correct!')
// })

// test(async t => {
//   const obj = {
//     arr: ['f1', 'f2', 'f3', 'f4']
//   }
//   const line = await utils.tests.setGeneral('set_ignore_users', obj)
//   t.true(line === "bot.set_ignore_users(['f1', 'f2', 'f3', 'f4'])")
// })
