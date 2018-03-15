var FtpDeploy = require('ftp-deploy');
var ftpDeploy = new FtpDeploy();
 
var config = {
    username: process.env.ftp_user,
    password: process.env.ftp_password,
    host: process.env.ftp_host,
    port: 21,
    localRoot: __dirname + "/../",
    remoteRoot: "/",
    include: ['*']
}
   
console.log(config);

ftpDeploy.on('uploading', function(data) {
  console.log(
    data.totalFileCount,       // total file count being transferred 
    data.transferredFileCount, // number of files transferred 
    data.percentComplete,      // percent as a number 1 - 100 
    data.filename);             // partial path with filename being uploaded 
});

ftpDeploy.deploy(config, function(err) {
    if (err) console.log(err)
    else console.log('finished');
});
