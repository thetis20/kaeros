import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function RegieTrackPicker({ tracks, tags, playingIds, onStart }) {
    const { t } = useTranslation();
    const [activeTag, setActiveTag] = useState('all');

    const filtered = activeTag === 'all' ? tracks : tracks.filter((track) => track.tags.includes(activeTag));

    function resolveTag(id) {
        return tags.find((tag) => tag.id === id);
    }

    return (
        <div>
            <div className="tabs" role="group" aria-label="tag-filter">
                <button
                    type="button"
                    classNworkflow-cardame={`btn btn-sm ${activeTag === 'all' ? 'is-active' : ''}`}
                    onClick={() => setActiveTag('all')}
                >{t('track.tag.all')}</button>
                {tags.map((tag) => (
                    <button
                        key={tag.id}
                        type="button"
                        className={`btn btn-sm ${activeTag === tag.id ? 'is-active' : ''}`}
                        onClick={() => setActiveTag(tag.id)}
                        style={{ background: `${tag.color}22`, color: tag.color }}
                    >{tag.name}</button>
                ))}
            </div>
            <div className="step-list">
                {filtered.map((track) => {
                    const playing = playingIds.includes(track.id);
                    return (
                        <div key={track.id} className="step-row">
                            <span className="dot" style={{background: resolveTag(track.tags[0])?.color}}/>
                            <span className="step-name">{track.name}</span>
                            {track.tags.map((tagId) => {
                                const tag = resolveTag(tagId);
                                return tag ? <span key={tagId} className="pill" style={{ background: `${tag.color}22`, color: tag.color }}>{tag.name}</span> : null;
                            })}
                            <button
                                type="button"
                                className="btn btn-sm"
                                disabled={playing}
                                onClick={() => onStart(track)}
                            >{playing ? t('track.playing') : t('track.start')}</button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default RegieTrackPicker;
