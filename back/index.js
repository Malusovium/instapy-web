const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const error = require('koa-json-error');
const koaRes = require('koa-res');
const logger = require('koa-logger');
const convert = require('koa-convert');
const serve = require('koa-static');
const send = require('koa-send');

const login = require('./login');
const getBot = require('./get-bot');
const botStatus = require('./bot-status');
const saveBot = require('./save-bot');
const startBot = require('./start-bot');
const stopBot = require('./stop-bot');
const getUserBot = require('./get-user-bot');
const saveUserBot = require('./save-user-bot');


const app = new Koa();
const router = new Router();
// const router = new Router({
//   prefix: '/api'
// });

router
  .get('/api/login', (ctx, next) => {
        ctx.response.set('Acces-Control-Allow-Origin', '*');
        ctx.set('Acces-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
        ctx.set('Acces-Control-Allow-Headers', 'Content-Type');
    ctx.body = 'hello worlds'
  })
  .post('/api/login', login)
  .post('/api/get-bot', getBot)
  .post('/api/bot-status', botStatus)
  .post('/api/save-bot', saveBot)
  .post('/api/start-bot', startBot)
  .post('/api/stop-bot', stopBot)
  .post('/api/save-user-bot', saveUserBot)
  .post('/api/get-user-bot', getUserBot)
  .redirect('/login', '/')
  .redirect('/bot-1', '/')
  .redirect('/bot-2', '/')

app
  .use(serve(__dirname + '/public'))
  // .use(function* index() {
  //   yield send(this, __dirname + '/index.html');
  // })
  .use(logger())
  .use(bodyParser())
  .use(convert(koaRes()))
  .use(router.routes())
  .use(router.allowedMethods({
    throw: false
  }));

const port = 3000;

app.listen(port);

console.log('hey beautifull,oh, ehrm yeah ofc. Instance running on port ' + port + ' my liege');
