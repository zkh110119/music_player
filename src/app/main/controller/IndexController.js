const {ipcMain} = require('electron');
const DB = require('./../db.js');
const RS = require('./../ResultSet.js');
const {v4} = require('uuid');
const request = require('request');
const path = require('path');
const fs = require('fs');
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

ipcMain.on('getPlayMenusByKeyword', (event, args) => {
    db = new DB();
    let sql, rs = null;
    if (args && args.kw) {
        sql = `SELECT * FROM "music_local" WHERE keyword LIKE '%${args.kw}%'`;
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
        let sql = `SELECT music_local.id,music_local.name,music_local.src,music_local.img_src,music_local.author,music_local.online_src,music_local.online_img_src FROM music_local left join music_menus on music_local.id = music_menus.pre where music_menus.id = '${args.id}'`;
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
        let sql = `SELECT music_local.id,music_local.name,music_local.src,music_local.img_src,music_local.author,music_local.online_src,music_local.online_img_src FROM music_local left join music_menus on music_local.id = music_menus.next where music_menus.id = '${args.id}'`;
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

ipcMain.on('downloadMusic', (event, args) => {
    let downloadSrc = {
        src: path.resolve('./cache/audio'),
        img_src: path.resolve('./cache/images')
    };
    let localSrc = {
        src: 'audio/',
        img_src: 'images/'
    };
    db = new DB();
    let rs = null;
    if (args && args.id) {
        let sql = `SELECT online_src,online_img_src FROM music_local WHERE id = '${args.id}'`;
        db.queryData(sql, (rows) => {
            db.close();
            for (let i = 0; i < rows.length; i++) {
                let map = {src: rows[i].online_src, img_src: rows[i].online_img_src};
                for (let key in map) {
                    let fileName = map[key].substring(map[key].lastIndexOf('/') + 1, map[key].length);
                    let stream = fs.createWriteStream(path.join(downloadSrc[key], fileName));
                    request(map[key]).pipe(stream).on('close', (err) => {
                        db = new DB();
                        let ud = `update music_local set ${key}='${path.join(localSrc[key], fileName)}' where id='${args.id}'`;
                        db.executeSql(ud);
                        db.close();
                        if (key == 'src' && args.rtn) {
                            rs = new RS(0, '下载成功！', {});
                            event.sender.send('renderer-download-finish', rs);
                        }
                    });
                }
            }
        });

    } else {
        rs = new RS(0, '非法数据参数！', {});
        event.sender.send('renderer-download-finish', rs);
    }
});
