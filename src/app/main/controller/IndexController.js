const {ipcMain} = require('electron');
const DB = require('./../db.js');
const RS = require('./../ResultSet.js');
let db = null;

ipcMain.on('getPlayMenus', (event, args) => {
    db = new DB();
    let sql, rs = null;
    if (args && args.id) {
        sql = `SELECT * FROM music_local where id ='${args.id}'`;
    } else {
        sql = `SELECT * FROM music_local where 1=1`
    }
    db.queryData(sql, (rows) => {
        rs = new RS(1, '', rows);
        db.close();
        event.returnValue = rs;
    });
});

ipcMain.on('getCurrentIdPreAndNext', (event, args) => {
    db = new DB();
    let rs = null;
    if (args && args.id) {
        let sql = `SELECT * FROM music_menus WHERE id = '${args.id}'`;
        db.queryData(sql, (rows) => {
            rs = new RS(1, '', rows);
            db.close();
            event.returnValue = rs;
        });
    } else {
        rs = new RS(0, '非法数据参数！', {});
        event.returnValue = rs;
    }
});

ipcMain.on('getPreIdById', (event, args) => {
    db = new DB();
    let rs = null;
    if (args && args.id) {
        let sql = `SELECT music_local.id,music_local.name,music_local.src  FROM music_local left join music_menus on music_local.id = music_menus.pre where music_menus.id = '${args.id}'`;
        db.queryData(sql, (rows) => {
            rs = new RS(1, '', rows);
            db.close();
            event.returnValue = rs;
        });
    } else {
        rs = new RS(0, '非法数据参数！', {});
        event.returnValue = rs;
    }
});


ipcMain.on('getNextIdById', (event, args) => {
    db = new DB();
    let rs = null;
    if (args && args.id) {
        let sql = `SELECT music_local.id,music_local.name,music_local.src  FROM music_local left join music_menus on music_local.id = music_menus.next where music_menus.id = '${args.id}'`;
        db.queryData(sql, (rows) => {
            rs = new RS(1, '', rows);
            db.close();
            event.returnValue = rs;
        });
    } else {
        rs = new RS(0, '非法数据参数！', {});
        event.returnValue = rs;
    }
});
