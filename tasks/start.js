//const childProcess = require('child_process');
//const electron = require('electron');
const gulp = require('gulp');

const electron = require('electron-connect').server.create({
  stopOnClose: true,
  // logLevel: 2
});

var callback = function(electronProcState) {
   if (electronProcState == 'stopped') {
    process.exit();
  }
};


gulp.task('start', ['build', 'watch'], () => {
  electron.start(callback);

  // Restart browser process
  gulp.watch('app/background.js', electron.restart);

  // Reload renderer process
  gulp.watch(['app/app.js', 'app/app.html'], electron.reload);
  // childProcess.spawn(electron, ['.'], { stdio: 'inherit' })
  // .on('close', () => {
  //   // User closed the app. Kill the host process.
  //   process.exit();
  // });
});
