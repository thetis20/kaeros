import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TimeFormPlaylist from './TimeFormPlaylist';
import DubbingFormPlaylist from './DubbingFormPlaylist';
const { v4: uuidv4 } = require('uuid');


function Playlist() {
    const { t } = useTranslation();
    const [value, setValue] = useState({
        id: uuidv4(),
        type: 'images',
        name: ""
    })

    function handleChange(e) {
        setValue(e.detail)
    }

    useEffect(() => {
        document.addEventListener('session-onchange', handleChange);
        return () => {
            document.removeEventListener('session-onchange', handleChange);
        }
    }, []);

    function onTypeChange(e) {
        const type = e.target.value
        if (type === 'time') {
            setValue({
                ...value,
                type,
                image: 'time',
                minutes: 60,
                number: 30
            })
        }
        if (type === 'dubbing') {
            setValue({
                ...value,
                type,
                videos: []
            })
        }
    }

    function onSubmit(e) {
        e.stopPropagation();
        e.preventDefault();
        window.electronAPI.playlistSave(value)
    }

    return (
        <section style={{ margin: 10 }}>
            <h1>{t('playlist.form.title', { context: value.createdAt ? 'edition' : 'creation' })}</h1>
            <form onSubmit={onSubmit}>
                <div style={{ marginBottom: 20 }}>
                    <label htmlFor="name" className="form-label">{t('playlist.form.name')}</label>
                    <input type="text" id="name" className="form-control" value={value.name} onChange={(e) => setValue({ ...value, name: e.target.value })} />
                </div>
                <div style={{ marginBottom: 20 }}>
                    <label htmlFor="type" className="form-label">{t('playlist.form.type.label')}</label>
                    <select className="form-select" id='type' value={value.type} onChange={onTypeChange}>
                        <option value=""></option>
                        <option value="images">{t('playlist.form.option.images')}</option>
                        <option value="time">{t('playlist.form.option.time')}</option>
                        <option value="dubbing">{t('playlist.form.option.dubbing')}</option>
                    </select>
                </div>
                {value.type === 'time' && <TimeFormPlaylist value={value} setValue={setValue} />}
                {value.type === 'dubbing' && <DubbingFormPlaylist value={value} setValue={setValue} />}
            </form>
        </section>
    );
}

export default Playlist;