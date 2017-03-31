// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

const {app, BrowserWindow} = require('electron');
import createWindow from './helpers/window';
import url from 'url';
import path from 'path';

require('electron-debug')({showDevTools: true});

let win;

app.on('ready', () => {
	const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
  });

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'app.html'),
    protocol: 'file:',
    slashes: true,
  }));

});

app.on('window-all-closed', () => {
  app.quit();
});
