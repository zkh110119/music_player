const {app} = require('electron');
const path = require('path');

console.log(process.defaultApp);
if (process.defaultApp) {
    if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient("music-player-z", process.execPath, [path.resolve(process.argv[1])]);
    }
} else {
    app.setAsDefaultProtocolClient("music-player-z");
}
