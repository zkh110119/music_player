const path = require('path');
const {app, BrowserWindow} = require('electron');
const debug = /--debug/.test(process.argv[2]);

let mainWindow = null;

function initialize() {
    makeSingleInstance();

    loadFunction();

    function createWindow() {
        const windowOptions = {
            width: 1024,
            minWidth: 1024,
            height: 690,
            minHeight: 690,
            title: app.getName(),
            frame: false,
            webPreferences: {
                nodeIntegration: true
            }
        };

        mainWindow = new BrowserWindow(windowOptions);
        mainWindow.loadURL(path.join('file://', __dirname, '/index.html'));

        if (debug) {
            mainWindow.webContents.openDevTools();
            require('devtron').install();
        }

        mainWindow.on('closed', () => {
            mainWindow = null;
        });
    }

    app.on('ready', () => {
        createWindow();
    });

    app.on('window-all-closed', () => {
        if (app.platform !== "darwin") {
            app.quit();
        }
    });

    app.on('activate', () => {
        if (mainWindow === null) {
            createWindow();
        }
    });
}

function makeSingleInstance() {
    app.requestSingleInstanceLock();
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized) {
                mainWindow.restore();
            }
            mainWindow.focus();
        }
    });
    if (!app.requestSingleInstanceLock()) {
        app.quit();
    }
}

function loadFunction() {
    require('./main/mainIpc.js');
    require('./main/controller/IndexController.js')
}

initialize();
