// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

const {app, BrowserWindow} = require('electron');
import url from 'url';
import path from 'path';
const windowStateKeeper = require('electron-window-state');


require('electron-debug')({showDevTools: true});


const isDev = require('electron-is-dev');

if (isDev) {
	console.log('Running in development');
} else {
	console.log('Running in production');
}


app.on('ready', () => {

  // Load the previous state with fallback to defaults
  let mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 600
  });  

// Create the window using the state information
  let mainWindow = new BrowserWindow({
    'x': mainWindowState.x,
    'y': mainWindowState.y,
    'width': mainWindowState.width,
    'height': mainWindowState.height
  });

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'app.html'),
    protocol: 'file:',
    slashes: true,
  }));
  
  mainWindowState.manage(mainWindow);
});

app.on('window-all-closed', () => {
  app.quit();
});
