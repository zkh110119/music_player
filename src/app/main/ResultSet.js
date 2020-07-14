class ResultSet {
    constructor(b, msg, data) {
        this.code = b ? 200 : 400;
        this.message = msg;
        this.rows = data;
    }
}

module.exports = ResultSet;
