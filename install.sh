echo "Installing Node..."
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

echo "Use Node version 10"
nvm install 10
nvm use 10

echo "Installing docker..."
apt install -y docker

echo "Installing docker-compose"
apt install -y docker-compose

source ~/.bashrc
