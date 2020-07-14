const {app, ipcMain, BrowserWindow} = require('electron');

ipcMain.on('closed-app-main', () => {
    app.quit();
});

ipcMain.on('maximize-app-window-main', () => {
    let currWindow = BrowserWindow.getFocusedWindow();
    currWindow.maximize();
});

ipcMain.on('restore-app-window-main', () => {
    let currWindow = BrowserWindow.getFocusedWindow();
    if (currWindow.isMaximized()) {
        currWindow.unmaximize();
    }
});

ipcMain.on('minimize-app-window-main', () => {
    let currWindow = BrowserWindow.getFocusedWindow();
    currWindow.minimize();
});
