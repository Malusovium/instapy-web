const env = require('../env.js')

const util = require('util')
const exec = util.promisify(require('child_process').exec);
const fs = require('fs')
const jsonfile = require('jsonfile')

const rootPath = env.rootDir
const dataPath = (env.test) ? rootPath + '/data-test' : rootPath + '/data'

const asyncJsonReadFile = (filePath, options) => {
  return new Promise((res, rej) => {
    jsonfile.readFile(filePath, options, (err, obj) => {
      if (obj) res(obj)
      if (err) rej(err)
    })
  })
}

const asyncJsonWriteFile = (filePath, data, options) => {
  console.log(filePath)
  console.log(data)
  return new Promise((res, rej) => {
    jsonfile.writeFile(filePath, data, options, (err) => {
      console.log(err)
      if (err) rej(err)
      res('succes')
    })
  })
}

const asyncWriteFile = (file, data, options) => {
  return new Promise((res, rej) => {
    console.log(file)
    console.log(data)
    fs.writeFile(file, data, options, (err) => {
      if (err) throw err
      res('succes6')
    })
  })
}

const br = (str) => str + '\n'

const arrToStr = (arr) => "['" + arr.join("', '") + "']"

const botStatus = async botId => {
  // const cmd1Out = await exec(`docker ps | grep bot${botId}`)
  const cmdOut = await exec(`docker ps -a`)
  // const std1Out = cmd1Out.stdout
  const processOut = cmdOut.stdout.split('\n')
    .filter(s => s.includes(`bot${botId}_web_1`))
    // .map( s => s.includes(`bot${botId}_web_1`) ? s : '')

  const stdOut = processOut.join('')

  const state = !!stdOut
    ? stdOut.includes('Up')
      ? 'running'
      : 'stopped'
    : 'off'

  return state
}

const startBot = async (botId) => {
  await exec(`docker-compose -f ${dataPath}/docker-compose.yml --project-directory ${dataPath}/bot-${botId} up -d --build`)
}

const stopBot = async (botId) => {
  await exec(`docker-compose -f ${dataPath}/docker-compose.yml --project-directory ${dataPath}/bot-${botId} down`)
}

const readUsersFile = async () => {
  const filePath = dataPath + '/users.json'
  try {
    const obj = await asyncJsonReadFile(filePath)
    const users = obj.data.users
    return users
  }
  catch (err) {
    return err
  }
}

const initNewBot = async (botId) => {
  await exec(`rm -fr ${dataPath}/bot-${botId}`)
  await exec(`cp -r ${dataPath}/bot ${dataPath}/bot-${botId}`)
  await exec(`rm ${dataPath}/bot-${botId}/docker_quickstart.py`)
  await exec(`touch ${dataPath}/bot-${botId}/docker_quickstart.py`)
  await exec(`touch ${dataPath}/bot-configs/${botId}.json`)
  await exec(`touch ${dataPath}/bot-configs/${botId}-user.json`)
}

const saveBotUserData = async (botId, userData) => {
  return await asyncJsonWriteFile(`${dataPath}/bot-configs/${botId}-user.json`, userData)
}

const saveBotConfig = async (botId, botConfig) => {
  return await asyncJsonWriteFile(`${dataPath}/bot-configs/${botId}.json`, botConfig)
}

const readBotUserData = async (botId) => {
  return await asyncJsonReadFile(`${dataPath}/bot-configs/${botId}-user.json`)
}

const readBotConfig = async (botId) => {
  return await asyncJsonReadFile(`${dataPath}/bot-configs/${botId}.json`)
}

const creatBotFile = async (botId, botConfig) => {
  return await asyncWriteFile(`${dataPath}/bot-${botId}/docker_quickstart.py`, botConfig)
}

const generateTop = async (data) => {
  const importInstaPy = "from instapy import InstaPy"
  const preBot = "bot = InstaPy("
  const user = `username='${data.userName}', `
  const pass = `password='${data.passWord}', `
  const afterBot = `selenium_local_session=False)`
  const initBot = preBot + user + pass + afterBot
  const selenium = "bot.set_selenium_remote_session(selenium_url='http://selenium:4444/wd/hub')"
  const login = "bot.login()"

  return [
    importInstaPy,
    '',
    initBot,
    selenium,
    login,
  ].join('\n') + '\n'
}

const genCodeLine = async (
    name,
    {
      arr,
      usernames,
      url,
      amount,
      enabled,
      random,
      randomize,
      percentage,
      media,
      times,
      interact,
      unfollow,
      limit,
      onlyInstaPyFollowed,
      onlyInstaPyMethod,
      sleepDelay
    }
  ) => {
  let args = []

  if(!!arr) args.push(arrToStr(arr))
  if(!!usernames) args.push('usernames=' + arrToStr(usernames))
  if(!!url) args.push('url=' + "'" + url + "'")
  if(!!amount) args.push('amount=' + amount)
  if(!!enabled) args.push('enabled=' + enabled)
  if(!!random) args.push('random=' + random)
  if(!!randomize) args.push('randomize=' + randomize)
  if(!!percentage) args.push('percentage=' + percentage)
  if(!!media) args.push('media=' + "'" + media + "'")
  if(!!times) args.push('times=' + times)
  if(!!interact) args.push('interact=' + interact)
  if(!!unfollow) args.push('unfollow=' + unfollow)
  if(!!limit) args.push('limit=' + limit)
  if(!!onlyInstaPyFollowed) args.push('onlyInstaPyFollowed=' + onlyInstaPyFollowed)
  if(!!onlyInstaPyMethod) args.push('onlyInstaPyMethod=' + "'" + onlyInstaPyMethod + "'")
  if(!!sleepDelay) args.push('sleep_delay=' + sleepDelay)

  return 'bot.' + name + '(' + args.join(', ') + ')'
}

const generateSettings = async ({
  sleepReduce,
  doComment,
  comments,
  doFollow,
  ignoreUsers,
  dontLike,
  ignoreIfContains,
  dontInclude,
  userInteract,
  upperFollowerCount,
  lowerFollowerCount
}) => {
  let codeLines = [];

  if(!!sleepReduce)
    codeLines.push(await genCodeLine('set_sleep_reduce', sleepReduce))
  if(!!doComment)
    codeLines.push(await genCodeLine('set_do_comment', doComment))
  if(!!comments)
    codeLines.push(await genCodeLine('set_comments', comments))
  if(!!doFollow)
    codeLines.push(await genCodeLine('set_do_follow', doFollow))
  if(!!ignoreUsers)
    codeLines.push(await genCodeLine('set_ignore_users', ignoreUsers))
  if(!!dontLike)
    codeLines.push(await genCodeLine('set_dont_like', dontLike))
  if(!!ignoreIfContains)
    codeLines.push(await genCodeLine('set_ignore_if_contains', ignoreIfContains))
  if(!!dontInclude)
    codeLines.push(await genCodeLine('set_dont_include', dontInclude))
  if(!!userInteract)
    codeLines.push(await genCodeLine('set_user_interact', userInteract))
  if(!!upperFollowerCount)
    codeLines.push(await genCodeLine('set_upper_follower_count', upperFollowerCount))
  if(!!lowerFollowerCount)
    codeLines.push(await genCodeLine('set_lower_follower_count', lowerFollowerCount))

  return codeLines.join('\n') + '\n'
}

const generateCommands = async ({
  likeByTags,
  likeFromImage,
  likeByUsers,
  likeByFeed,
  followByList,
  followUserFollowers,
  interactUserFollowers,
  interactUserFollowing,
  followUserFollowing,
  unfollowUsers
}) => {
  let codeLines = [];

  if(!!likeByTags)
    codeLines.push(await genCodeLine('like_by_tags', likeByTags))
  if(!!likeFromImage)
    codeLines.push(await genCodeLine('like_from_image', likeFromImage))
  if(!!likeByUsers)
    codeLines.push(await genCodeLine('like_by_users', likeByUsers))
  if(!!likeByFeed)
    codeLines.push(await genCodeLine('like_by_feed', likeByFeed))
  if(!!followByList)
    codeLines.push(await genCodeLine('follow_by_list', followByList))
  if(!!followUserFollowers)
    codeLines.push(await genCodeLine('follow_user_followers', followUserFollowers))
  if(!!interactUserFollowers)
    codeLines.push(await genCodeLine('interact_user_followers', interactUserFollowers))
  if(!!interactUserFollowing)
    codeLines.push(await genCodeLine('interact_user_following', interactUserFollowing))
  if(!!followUserFollowing)
    codeLines.push(await genCodeLine('follow_user_following', followUserFollowing))
  if(!!unfollowUsers)
    codeLines.push(await genCodeLine('unfollow_users', unfollowUsers))

  return codeLines.join('\n') + '\n'
}

const generateEnd = async () => {
  return 'bot.end()\n'
}

const generateConfig = async (data, userData) => {
  const head = await generateTop({userName: userData.userName, passWord: userData.passWord})
  const settings = await generateSettings(data.settings)
  const commands = await generateCommands(data.commands)
  const end = await generateEnd()

  return head + settings + commands + end
}

module.exports = {
  initNewBot,
  readUsersFile,
  generateConfig,
  saveBotConfig,
  readBotConfig,
  botStatus,
  startBot,
  stopBot,
  creatBotFile,
  saveBotUserData,
  readBotUserData,
  tests: {
    initNewBot,
    readUsersFile,
    generateTop,
    genCodeLine,
    generateSettings,
    generateCommands,
    generateConfig
  }
}
