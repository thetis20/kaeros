const Store = require('electron-store').default;
const migrations = require('./migrations.js');

const store = new Store({migrations});

module.exports = store