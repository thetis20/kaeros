const Store = require('electron-store').default;

const store = new Store({
    migrations: {
        '0.0.1': store => {
            store.set('playlists', []);
        }
    }
});

module.exports = store