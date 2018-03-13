#install node

sudo apt-get install -y lftp
lftp -e "mirror -R ./ /public_html" -u {username},{password} {host}

#angular build
cd src-ui;
npm install;
npm run ng build --env prod;
cd ..;

#delete unused folders
rm -rf src-ui;
rm -rf .circleci;
rm -rf .git;
rm -rf .vscode; 
rm -rf web/ui/assets/settings.json

#build artifact
mkdir /tmp/artifacts;
zip -r /tmp/artifacts/web.zip .
