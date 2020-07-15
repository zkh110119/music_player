const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const file = path.resolve('./db/music_player_db.db');

class SqliteDB {
    constructor() {
        this.db = new sqlite3.Database(file);

        this.exist = fs.existsSync(file);
        if (!this.exist) {
            console.log("Creating db file!");
            fs.openSync(file, 'w');
        }
    }

    printErrorInfo(err) {
        console.log("Error Message:" + err.message + " ErrorNumber:" + err.no);
    }

    createTable(sql) {
        this.db.serialize(() => {
            this.db.run(sql, (err) => {
                if (null != err) {
                    this.printErrorInfo(err);
                    return;
                }
            })
        });
    }

    insertData(sql, objects) {
        this.db.serialize(function () {
            let stmt = this.db.prepare(sql);
            for (let i = 0; i < objects.length; i++) {
                stmt.run(objects[i]);
            }
            stmt.finalize();
        });
    }

    queryData(sql, callback) {
        this.db.all(sql, (err, rows) => {
            if (null != err) {
                this.printErrorInfo(err);
                return;
            }

            if (callback) {
                callback(rows);
            }
        });
    }

    executeSql(sql) {
        this.db.run(sql, (err) => {
            if (null != err) {
                this.printErrorInfo(err);
            }
        });
    };

    close() {
        this.db.close();
    };

}

module.exports = SqliteDB;
