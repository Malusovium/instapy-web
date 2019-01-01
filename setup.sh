echo "creating data directory..."
mkdir -p ./data
echo "Cloning InstaPy project..."
git clone https://github.com/timgrossmann/InstaPy ./data/InstaPy

cp dotEnv project/.env

cd project
npm i
npm run front:build
