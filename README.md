# instapy-web

### introduction

A gui for instapy in the browser!

## requirements

* docker
* docker-compose
* node > 10
* linux, ubuntu > 16

### ScreenShots

![Login Page](https://github.com/Malusovium/instapy-web/blob/master/login.png)
![Bot Page](https://github.com/Malusovium/instapy-web/blob/master/bot.png)
![Config Page](https://github.com/Malusovium/instapy-web/blob/master/config.png)

### Installation

Clone the project
```sh
git clone https://github.com/Malusovium/instapy-web instapy-web && \
cd instapy-web && \
git checkout tags/v0.0.1
```

Change environment variables
Note dosen't have to be vim just an editor o
```sh
cp dotEnv .env
vim .env
```

Make sure you have an A record pointing to yourdomain.
On a server
```sh
NODE_ENV=production

DOMAIN=mydomain.com

EMAIL=myEmail@gimail.com

USER_NAME=myUser
PASS_WORD=myPass

JWT_SECRET=MySecret
```

Install dependancies
```sh
sh install.sh
```

Setup server
```sh
sh setup.sh
```

### Usage

Starting server
```sh
sh start.sh
```

Stopping server
```sh
sh stop.sh
```

### Developers

Setup
```sh
mkdir data
git clone https://github.com/timgrossman/InstaPy ./data/InstaPy
cd project
npm i
```

Start backend
```sh
# in project
npm run front:dev
```

Start frontend
```sh
# in project
npm run back:dev
```

Navigate to browser
`http://localhost:1234`
