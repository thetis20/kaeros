import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconUpload } from '@tabler/icons-react';
import useTracks from '../Hook/useTracks';
import useTags from '../Hook/useTags';
import TagMultiSelect from '../Tag/TagMultiSelect';
import { getFilename, hasSource, resolveAutoFillName } from '../../lib/filename';

const EMPTY_FORM = { name: '', tags: [], startOffsetMs: 0 };

function MusiqueScreen() {
    const { t } = useTranslation();
    const tracks = useTracks();
    const tags = useTags();
    const [activeTag, setActiveTag] = useState('all');
    const [value, setValue] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const previewRef = useRef(null);
    const blobUrlRef = useRef(null);

    function revokeBlobUrl() {
        if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current);
            blobUrlRef.current = null;
        }
    }

    useEffect(() => () => revokeBlobUrl(), [value.file]);

    function testPlayback() {
        const audioEl = previewRef.current;
        if (!audioEl || !hasSource(value)) return;

        revokeBlobUrl();
        if (value.file) {
            const url = URL.createObjectURL(value.file);
            blobUrlRef.current = url;
            audioEl.src = url;
        } else {
            audioEl.src = 'file://' + value.src;
        }
        audioEl.load();

        function onLoadedMetadata() {
            audioEl.currentTime = (Number(value.startOffsetMs) || 0) / 1000;
            audioEl.play();
            audioEl.removeEventListener('loadedmetadata', onLoadedMetadata);
        }
        audioEl.addEventListener('loadedmetadata', onLoadedMetadata);
    }

    const filtered = activeTag === 'all' ? tracks : tracks.filter((track) => track.tags.includes(activeTag));

    function resolveTag(id) {
        return tags.find((tag) => tag.id === id);
    }

    function handleFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        const name = resolveAutoFillName(value.name, undefined, file.name);
        setValue({ ...value, file, name });
        if (errors.src) setErrors({ ...errors, src: undefined });
    }

    function validate(value) {
        const errors = {};
        if (!value.name || !value.name.trim()) errors.name = t('musique.form.error.name');
        if (!Array.isArray(value.tags) || value.tags.length === 0) errors.tags = t('musique.form.error.tags');
        if (!hasSource(value)) errors.src = t('musique.form.error.src');
        if (value.startOffsetMs !== undefined && value.startOffsetMs !== '' && (!Number.isInteger(Number(value.startOffsetMs)) || Number(value.startOffsetMs) < 0)) {
            errors.startOffsetMs = t('musique.form.error.startOffset');
        }
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
        window.electronAPI.trackSave(value);
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
        <div className="content">
            <p className="screen-title">{t('musique.title')}</p>

            <form onSubmit={onSubmit} className="card" style={{ marginBottom: 16 }}>
                <p className="screen-sub" style={{marginBottom: 12}}>{t('musique.form.title')}</p>
                <label htmlFor="track-name" className="field-label">{t('musique.form.name')}</label>
                <input
                    type="text"
                    id="track-name"
                    style={{ width: '100%', marginBottom: 10 }}
                    className={errors.name ? 'is-invalid' : ''}
                    value={value.name}
                    onChange={(e) => {
                        setValue({ ...value, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}

                <label htmlFor="track-tags" className="field-label">{t('musique.form.tags')}</label>
                <TagMultiSelect
                    id="track-tags"
                    className={errors.tags ? 'is-invalid' : ''}
                    tags={tags}
                    value={value.tags}
                    onChange={(newTags) => {
                        setValue({ ...value, tags: newTags });
                        if (errors.tags) setErrors({ ...errors, tags: undefined });
                    }}
                />
                {errors.tags && <div className="invalid-feedback">{errors.tags}</div>}

                <label htmlFor="track-src" className="field-label" style={{marginTop: 12, display: 'block'}}>{t('musique.form.src')}</label>
                <div className="file-row">
                    <div className="file-thumb"><IconUpload size={18}/></div>
                    <input
                        type="file"
                        className={errors.src ? 'is-invalid' : undefined}
                        style={{ display: 'none' }}
                        id="track-src"
                        onChange={handleFile}
                    />
                    <label className="btn btn-sm" htmlFor="track-src"><IconUpload size={14}/>{getFilename(value, t('musique.form.placeholder'))}</label>
                </div>
                {errors.src && <div className="invalid-feedback">{errors.src}</div>}

                <label htmlFor="track-start-offset" className="field-label" style={{marginTop: 12, display: 'block'}}>{t('musique.form.startOffset')}</label>
                <input
                    type="number"
                    id="track-start-offset"
                    min="0"
                    style={{ width: '100%', marginBottom: 10 }}
                    className={errors.startOffsetMs ? 'is-invalid' : ''}
                    value={value.startOffsetMs ?? ''}
                    onChange={(e) => {
                        setValue({ ...value, startOffsetMs: e.target.value });
                        if (errors.startOffsetMs) setErrors({ ...errors, startOffsetMs: undefined });
                    }}
                />
                {errors.startOffsetMs && <div className="invalid-feedback">{errors.startOffsetMs}</div>}

                {hasSource(value) && (
                    <div style={{ marginTop: 8 }}>
                        <audio ref={previewRef} controls style={{ width: '100%', marginBottom: 8 }}/>
                        <button type="button" className="btn btn-sm" onClick={testPlayback}>{t('musique.form.test')}</button>
                    </div>
                )}

                <button type="submit" className="btn btn-accent-solid" style={{ marginTop: 8 }}>{t('musique.form.submit')}</button>
            </form>

            <div className="tabs" role="group" aria-label="tag-filter">
                <button type="button" className={`btn btn-sm ${activeTag === 'all' ? 'is-active' : ''}`} onClick={() => setActiveTag('all')}>{t('track.tag.all')}</button>
                {tags.map((tag) => (
                    <button key={tag.id} type="button" className={`btn btn-sm ${activeTag === tag.id ? 'is-active' : ''}`} style={{ background: `${tag.color}22`, color: tag.color }} onClick={() => setActiveTag(tag.id)}>{tag.name}</button>
                ))}
            </div>

            {filtered.length === 0 && <p className="screen-sub">{t('musique.empty')}</p>}

            <div className="step-list">
                {filtered.map((track) => (
                    <div key={track.id} className="step-row">
                        <span className="dot" style={{ background: resolveTag(track.tags[0])?.color }}/>
                        <span className="step-name">{track.name}</span>
                        {track.tags.map((tagId) => {
                            const tag = resolveTag(tagId);
                            return tag ? <span key={tagId} className="pill" style={{ background: `${tag.color}22`, color: tag.color }}>{tag.name}</span> : null;
                        })}
                        <button type="button" className="btn btn-sm" onClick={() => edit(track)}>{t('musique.edit')}</button>
                        <button type="button" className="btn btn-sm" onClick={() => remove(track)}>{t('musique.remove')}</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MusiqueScreen;
