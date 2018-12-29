# instapy-web

### introduction

A gui for instapy in the browser!

## requirements

* docker
* docker-compose
* node > 10
* linux, ubuntu > 16

### Installation

Clone the project
```sh
git clone https://github.com/Malusovium/instapy-web
```

Go in to project
```sh
cd instapy-web
```

Change environment variables
Note dosen't have to be vim just an editor o
```sh
vim dotEnv
```

Make sure you have an A record pointing to yourdomain.
On a server
```sh
NODE_ENV=production

DOMAIN=mydomain.com

EMAIL=myEmail@gimail.com
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
