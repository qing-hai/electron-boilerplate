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
const shelljs=require("shelljs");
const uglifyjs = require('uglify-js-harmony'); // can be a git checkout 
                                     // or another module (such as `uglify-js-harmony` for ES6 support) 
const minifier = require('gulp-uglify/minifier');

const combiner=require("stream-combiner2");

const projectDir = jetpack;
const srcDir = jetpack.cwd('./src');
const destDir = jetpack.cwd('./app');

gulp.task('clean', function(callback) {
    gulpUtil.log({platform:process.platform, env: utils.getEnvName()});

    return destDir.dirAsync('.', { empty: true });
});

gulp.task('clean-dist', function(callback) {
    gulpUtil.log({platform:process.platform, env: utils.getEnvName()});

    return projectDir.cwd('./dist').dirAsync('.', { empty: true });
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

gulp.task('uglify-js', function() {
    let combined = combiner.obj([
        gulp.src(['./app/**/*.js','!./app/node_modules/**/*.js','!./app/**/*min.js']),
        minifier({  
             compress: {
                    unused: false
             },
             //mangle:false
        }, uglifyjs),
        gulp.dest(destDir.path())
    ]);

  // any errors in the above streams will get caught
  // by this listener, instead of being thrown:
  combined.on('error', console.error.bind(console));

  return combined;
});


gulp.task('environment', () => {
  const configFile = `config/env_${utils.getEnvName()}.json`;
  projectDir.copy(configFile, destDir.path('env.json'), { overwrite: true });
});

gulp.task('copy-node-modules', function(){
    return gulp.src([
                      './src/node_modules/**',
                      '!./src/node_modules/**/*.png',
                      '!./src/node_modules/**/test/**',
                      '!./src/node_modules/**/examples/**',
                      '!./src/node_modules/**/example/**',
                      '!./src/node_modules/**/samples/**',
                      '!./src/node_modules/**/demo/**',
                      '!./src/node_modules/**/docs/**',
                      '!./src/node_modules/**/samples/**',
                      '!./src/node_modules/**/benchmark/**',
                      '!./src/node_modules/**/dev-playground/**',
                      '!./src/node_modules/**/*.md',
                      '!./src/node_modules/**/*.html',
                      '!./src/node_modules/**/*.swf',
                      '!./src/node_modules/**/*.js.map',
                      '!./src/node_modules/**/ChangeLog',
                      '!./src/node_modules/**/LICENSE.BSD',
                      '!./src/node_modules/**/LICENSE',
                      '!./src/node_modules/**/*.o',
                      '!./src/node_modules/**/*.c',
                      '!./src/node_modules/**/*.cc',
                      '!./src/node_modules/**/*.gyp',
                      '!./src/node_modules/**/*.h',
                      '!./src/node_modules/**/*.pdb',
                      '!./src/node_modules/**/*.obj',
                      '!./src/node_modules/lodash/**',
                      '!./src/node_modules/faker/**',
                      '!./src/node_modules/knex/**',
                      '!./src/node_modules/docxtemplater/**',
                      '!./src/node_modules/moment/**',
                      '!./src/node_modules/moment-timezone/**',
                      '!./src/node_modules/vue/**',
                      '!./src/node_modules/linebreak/**',
                      '!./src/node_modules/esprima-fb/**',
                      '!./src/node_modules/asyncawait/node_modules/lodash/**',
                      '!./src/node_modules/fibers/build/**',

                      '!./src/node_modules/kerberos/bin/**',
                      '!./src/node_modules/kerberos/build/*.*',
                      '!./src/node_modules/kerberos/build/Release/obj/**',
                      '!./src/node_modules/kerberos/build/Release/*.map',
                      

                    ])
        .pipe(gulp.dest(destDir.path('node_modules')));
})

gulp.task('link-modules',function(){
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

  watch('src/**/*.[j,t]s', batch((events, done) => {
    gulp.start('bundle', beepOnError(done));
  }));

  watch('src/**/*.less', batch((events, done) => {
    gulp.start('less', beepOnError(done));
  }));

    watch('src/**/*.html', batch((events, done) => {
    gulp.start('html', beepOnError(done));
  }));
});

gulp.task('build',function(callback) {
   if (!utils.isProd()){
      runSequence(['clean','clean-dist'],
                ['link-modules','bundle', 'less','html', 'environment'],
                callback);
   }else
      runSequence('clean',
                ['copy-node-modules','bundle', 'less','html', 'environment'],
                ['uglify-js'],
                callback);
});
