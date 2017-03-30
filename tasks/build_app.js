const gulp = require('gulp');
const gulpUtil=require('gulp-util');
const less = require('gulp-less');
const watch = require('gulp-watch');
const batch = require('gulp-batch');
const plumber = require('gulp-plumber');
const runSequence = require('run-sequence');
const jetpack = require('fs-jetpack');
const bundle = require('./bundle');
const utils = require('./utils');


const projectDir = jetpack;
const srcDir = jetpack.cwd('./src');
const destDir = jetpack.cwd('./app');


gulp.task('clean', function(callback) {
    gulpUtil.log({platform:process.platform, env: utils.getEnvName()});

    return destDir.dirAsync('.', { empty: true });
});

gulp.task('bundle',  () => {
  return Promise.all([
    bundle(srcDir.path('background.js'), destDir.path('background.js')),
    bundle(srcDir.path('app.js'), destDir.path('app.js')),
  ]);
});

gulp.task('less',() => {
  return gulp.src(srcDir.path('stylesheets/main.less'))
  .pipe(plumber())
  .pipe(less())
  .pipe(gulp.dest(destDir.path('stylesheets')));
});

gulp.task('html', () => {
  return gulp.src(srcDir.path('**/*.html'))
   .pipe(gulp.dest(destDir.path()));
});


gulp.task('environment', () => {
  const configFile = `config/env_${utils.getEnvName()}.json`;
  projectDir.copy(configFile, destDir.path('env.json'), { overwrite: true });
});


gulp.task('link',['copy'],function(){
    var shellCmd="";
    if (process.platform === 'win32'){
	    shellCmd='mklink /J ".\\app\\node_modules" ".\\src\\node_modules"';
    }else{
	    shellCmd="ln -sf ../src/node_modules app/node_modules";
    }
    
    return shelljs.exec(shellCmd); 
})

gulp.task('watch', () => {
  const beepOnError = (done) => {
    return (err) => {
      if (err) {
        utils.beepSound();
      }
      done(err);
    };
  };

  watch('src/**/*.js', batch((events, done) => {
    gulp.start('bundle', beepOnError(done));
  }));
  watch('src/**/*.less', batch((events, done) => {
    gulp.start('less', beepOnError(done));
  }));
});

gulp.task('build',function(callback) {
  runSequence('clean',
              ['bundle', 'less','html', 'environment']);
});
