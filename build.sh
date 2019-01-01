cp .env ./project/.env
cd project
rm -fr .cache
rm -fr build
npm run front:build
