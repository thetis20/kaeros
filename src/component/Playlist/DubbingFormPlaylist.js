import { Fragment } from 'react';
import { Plus, Trash } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
const { v4: uuidv4 } = require('uuid');

function VideoFormPlaylist({ video, onChange, onRemove }) {
    const { t } = useTranslation();

    function getFilename() {
        if (video.file) {
            return video.file?.name
        }
        if (video.src) {
            const regex = /\/([^/]*\..*)/g;

            const array = [...video.src.matchAll(regex)];

            return array[0][1]
        }
        return t('video.form.placeholder')
    }

    function handleRemove(e) {
        e.stopPropagation();
        e.preventDefault();
        onRemove(video.id)
    }

    function handleChange(k, v) {
        onChange({
            ...video,
            [k]: v
        })
    }

    function handleFile(e) {
        const file = e.target.files[0]
        onChange({
            ...video,
            'file': file
        })
    }

    return <div style={{
        marginBottom: 30,
        borderTop: 'solid 1px grey',
        marginLeft: 20,
        paddingTop: 10,
        display: 'flex',
        flexDirection: 'column'
    }}>
        <button
            className='btn btn-danger'
            onClick={handleRemove}
            style={{ alignSelf: 'flex-end' }}
        >
            <Trash />
        </button>
        <div className='form-group'>
            <label htmlFor={`video-name-${video.id}`} class="form-label">{t('video.form.name')}</label>
            <input
                type="text"
                id={`video-name-${video.id}`}
                class="form-control"
                value={video.name}
                onChange={(e) => handleChange('name', e.target.value)}
            />
        </div>
        <div className='form-group'>
            <label htmlFor={`video-file-${video.id}`} className="form-label">{t('video.form.label')}</label>
            <div className="custom-file">
                <input
                    type="file"
                    style={{ display: 'none' }}
                    className="custom-file-input"
                    id={`video-file-${video.id}`}
                    onChange={handleFile}
                />
                <label className="btn btn-light" htmlFor={`video-file-${video.id}`}>{getFilename(video)}</label>
            </div>
        </div>
        <div className='form-group'>
            <label htmlFor={`video-time-${video.id}`} class="form-label">{t('video.form.time')}</label>
            <input
                type="text"
                id={`video-time-${video.id}`}
                class="form-control"
                value={video.time}
                onChange={(e) => handleChange('time', e.target.value)}
            />
        </div>
        <div className='form-group'>
            <label htmlFor={`video-description-${video.id}`} class="form-label">{t('video.form.description')}</label>
            <textarea
                type="text"
                id={`video-description-${video.id}`}
                class="form-control"
                value={video.description}
                onChange={(e) => handleChange('description', e.target.value)}
            />
        </div>
    </div>
}

function DubbingFormPlaylist({ value, setValue }) {
    const { t } = useTranslation();

    function add(e) {
        e.stopPropagation();
        e.preventDefault();
        const videos = value.videos
        videos.push({
            id: uuidv4()
        })
        setValue({
            ...value,
            videos: [...videos]
        })
    }

    function onChange(video) {
        setValue({
            ...value,
            videos: value.videos.map(v => v.id === video.id ? video : v)
        })
    }

    function onRemove(id) {
        setValue({
            ...value,
            videos: value.videos.filter(v => v.id !== id)
        })
    }

    return (
        <Fragment>
            {(value.videos || []).map(video => <VideoFormPlaylist video={video} onChange={onChange} onRemove={onRemove} />)}
            <div style={{ marginBottom: 10 }}>
                <button className='btn btn-secondary' onClick={add}><Plus /></button>
            </div>
            <input className="btn btn-primary" style={{ marginBottom: 30 }} type="submit" value={t('playlist.form.submit')} />
        </Fragment>
    );
}

export default DubbingFormPlaylist;
