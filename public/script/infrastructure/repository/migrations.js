const {v4: uuidv4} = require('uuid');
const TAG_COLOR_PALETTE = require('../../application/entity/tagColorPalette');

const FIXED_TAG_NAMES = ['Musique', 'Bruitage', 'Disco'];

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
    '0.3.0': store => {
        const existingTags = store.get('tags') || [];
        const tagByName = {};
        for (const t of existingTags) tagByName[t.name] = t;

        const newTags = [];
        FIXED_TAG_NAMES.forEach((name, index) => {
            if (!tagByName[name]) {
                const tag = {id: uuidv4(), name, color: TAG_COLOR_PALETTE[index]};
                tagByName[name] = tag;
                newTags.push(tag);
            }
        });
        store.set('tags', existingTags.concat(newTags));

        const tracks = store.get('tracks') || [];
        store.set('tracks', tracks.map(track => {
            if (Array.isArray(track.tags)) return track;

            const {tag, color, ...rest} = track;
            const matchedTag = tagByName[tag];
            return {...rest, tags: matchedTag ? [matchedTag.id] : []};
        }));
    },
};

module.exports = migrations;
