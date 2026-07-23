import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useTracks from '../Hook/useTracks';
import { getFilename, hasSource } from '../../lib/filename';

const TAGS = ['Musique', 'Bruitage', 'Disco'];
const TAG_COLORS = {
    Musique: '#4C6EFF',
    Bruitage: '#F76707',
    Disco: '#AE3EC9',
};
const EMPTY_FORM = { name: '', tag: 'Musique' };

function MusiqueScreen() {
    const { t } = useTranslation();
    const tracks = useTracks();
    const [activeTag, setActiveTag] = useState('all');
    const [value, setValue] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});

    const filtered = activeTag === 'all' ? tracks : tracks.filter((track) => track.tag === activeTag);

    function handleFile(e) {
        const file = e.target.files[0];
        setValue({ ...value, file });
        if (errors.src) setErrors({ ...errors, src: undefined });
    }

    function validate(value) {
        const errors = {};
        if (!value.name || !value.name.trim()) errors.name = t('musique.form.error.name');
        if (!value.tag || !TAGS.includes(value.tag)) errors.tag = t('musique.form.error.tag');
        if (!hasSource(value)) errors.src = t('musique.form.error.src');
        return errors;
    }

    function onSubmit(e) {
        e.preventDefault();
        const validationErrors = validate(value);
        if (Object.keys(validationErrors).length) {
            setErrors(validationErrors);
            return;
        }
        setErrors({});
        window.electronAPI.trackSave({
            ...value,
            color: value.color || TAG_COLORS[value.tag],
        });
        setValue(EMPTY_FORM);
    }

    function edit(track) {
        setValue(track);
        setErrors({});
    }

    function remove(track) {
        window.electronAPI.trackRemove(track.id);
    }

    return (
        <div style={{ padding: '1em' }}>
            <h1>{t('musique.title')}</h1>

            <form onSubmit={onSubmit} style={{ marginBottom: '1.5em' }}>
                <h2>{t('musique.form.title')}</h2>
                <div className="form-group">
                    <label htmlFor="track-name" className="form-label">{t('musique.form.name')}</label>
                    <input
                        type="text"
                        id="track-name"
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        value={value.name}
                        onChange={(e) => {
                            setValue({ ...value, name: e.target.value });
                            if (errors.name) setErrors({ ...errors, name: undefined });
                        }}
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>
                <div className="form-group">
                    <label htmlFor="track-tag" className="form-label">{t('musique.form.tag')}</label>
                    <select
                        id="track-tag"
                        className={`form-select ${errors.tag ? 'is-invalid' : ''}`}
                        value={value.tag}
                        onChange={(e) => {
                            setValue({ ...value, tag: e.target.value });
                            if (errors.tag) setErrors({ ...errors, tag: undefined });
                        }}
                    >
                        {TAGS.map((tag) => <option key={tag} value={tag}>{t(`track.tag.${tag}`)}</option>)}
                    </select>
                    {errors.tag && <div className="invalid-feedback">{errors.tag}</div>}
                </div>
                <div className="form-group">
                    <label htmlFor="track-src" className="form-label">{t('musique.form.src')}</label>
                    <div>
                        <input
                            type="file"
                            className={errors.src ? 'is-invalid' : undefined}
                            style={{ display: 'none' }}
                            id="track-src"
                            onChange={handleFile}
                        />
                        <label className="btn btn-light" htmlFor="track-src">{getFilename(value, t('musique.form.placeholder'))}</label>
                        {errors.src && <div className="invalid-feedback">{errors.src}</div>}
                    </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5em' }}>{t('musique.form.submit')}</button>
            </form>

            <div className="btn-group" role="group" aria-label="tag-filter">
                <button type="button" className={`btn ${activeTag === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTag('all')}>{t('track.tag.all')}</button>
                {TAGS.map((tag) => (
                    <button key={tag} type="button" className={`btn ${activeTag === tag ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTag(tag)}>{t(`track.tag.${tag}`)}</button>
                ))}
            </div>

            {filtered.length === 0 && <p>{t('musique.empty')}</p>}

            <ul style={{ listStyle: 'none', padding: 0, marginTop: '1em' }}>
                {filtered.map((track) => (
                    <li key={track.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75em', padding: '0.5em 0' }}>
                        <span style={{ width: '1em', height: '1em', borderRadius: '50%', background: track.color, display: 'inline-block' }}/>
                        <span style={{ flex: 1 }}>{track.name}</span>
                        <button type="button" className="btn btn-sm btn-warning" onClick={() => edit(track)}>{t('musique.edit')}</button>
                        <button type="button" className="btn btn-sm btn-danger" onClick={() => remove(track)}>{t('musique.remove')}</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default MusiqueScreen;
