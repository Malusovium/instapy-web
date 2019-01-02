# instapy-web

This isn't production ready yet hence the 0.X.X
Use at your own risk!
A complete rewrite is comming, expect breaking changes.
Updating will probably a pain.
Any feedback is more than welcome!

InstaPy functionality with
[instapy-tools](https://github.com/Malusovium/instapy-tools)

### introduction

A gui for InstaPy on the web.
Mobile first design.
Simple install instructions.

Tip: add this to your mobile homescreen for the best experience.

## requirements

* vps, with 1gb
* docker
* docker-compose
* node > 10
* linux

### ScreenShots

![Login Page](https://github.com/Malusovium/instapy-web/blob/master/login.png)
![Bot Page](https://github.com/Malusovium/instapy-web/blob/master/bot.png)
![Config Page](https://github.com/Malusovium/instapy-web/blob/master/config.png)

### Installation

Clone the project
```sh
git clone https://github.com/Malusovium/instapy-web instapy-web && \
cd instapy-web && \
git checkout tags/v0.1.0
```

#### Change environment variables
Note: dosen't have to be vim just an editor you like.
```sh
cp dotEnv .env
vim .env
```

Note: Make sure you have an A record from yourdomain.example pointing to your vps!
```sh
NODE_ENV=production

DOMAIN=mydomain.com

EMAIL=myEmail@gimail.com

USER_NAME=myUser
PASS_WORD=myPass

JWT_SECRET=MySecret
```

#### Install dependancies
Note: Only for Ubuntu users,
using another distro? skip this step.
```sh
sh install.sh
```

#### Setup server
```sh
sh setup.sh
```

Installation complete happy automating!

### Usage

#### Starting server
```sh
sh start.sh
```

#### Stopping server
```sh
sh stop.sh
```

### Developers

#### Setup
```sh
mkdir data
git clone https://github.com/timgrossman/InstaPy ./data/InstaPy
cd project
npm i
```

#### Start backend
```sh
# in project
npm run front:dev
```

#### Start frontend
```sh
# in project
npm run back:dev
```

#### Navigate to browser
`http://localhost:1234`

happy developing!
