const { app, BrowserWindow } = require('electron');
const path = require('path');
let mainWin = null;

let createWindow = () => {
    mainWin = new BrowserWindow({
        width: 960,
        height: 640,
        minHeight: 640,
        minWidth: 960,
        //frame: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWin.loadFile(path.join(__dirname, '/index.html'));
    app.on('close', () => {
        app.quit();
    })
};

app.on('ready', createWindow);

app.on('window-all-close', () => {
    if (process.platform !== 'drawin') {
        app.quit();
    }
});