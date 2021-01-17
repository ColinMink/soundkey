const Settings = require("../../settings");
const dbSettings = Settings[Settings.env].db;

module.exports = async function startSession(table) {
    return mysqlx.getSession(dbSettings).getTable(table);
};