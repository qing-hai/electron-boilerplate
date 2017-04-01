const argv = require('minimist')(process.argv);

exports.getEnvName = () => {
  return argv.env || 'development';
};

exports.isProd= ()=>{
  let env=argv.env || 'development';

  return env==="production" || env==="prod";
}

exports.beepSound = () => {
  process.stdout.write('\u0007');
};
