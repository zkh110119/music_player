const {ipcRenderer} = require('electron');

let closeWindow = () => {
    ipcRenderer.send('closed-app-main');
};

let maximizeWindow = () => {
    ipcRenderer.send('maximize-app-window-main');
};

let restoreWindow = () => {
    ipcRenderer.send('restore-app-window-main');
};

let minimizeWindow = () => {
    ipcRenderer.send('minimize-app-window-main');
};

module.exports = {
    closeWindow: closeWindow,
    maximizeWindow: maximizeWindow,
    restoreWindow: restoreWindow,
    minimizeWindow: minimizeWindow
};
