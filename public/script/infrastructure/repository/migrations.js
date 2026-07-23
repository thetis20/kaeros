const migrations = {
    '0.0.1': store => {
        store.set('playlists', []);
    },
    '0.1.0': store => {
        const folders = store.get('folders') || [];
        const tracks = [];
        for (const folder of folders) {
            const audios = store.get('audios_' + folder.id) || [];
            for (const audio of audios) {
                tracks.push({
                    id: audio.id,
                    name: audio.name,
                    src: audio.src,
                    color: audio.color,
                    tag: 'Musique',
                    createdAt: audio.createdAt,
                    updatedAt: audio.updatedAt,
                });
            }
        }
        store.set('tracks', (store.get('tracks') || []).concat(tracks));
    },
};

module.exports = migrations;
