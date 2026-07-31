import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const TAGS = ['Musique', 'Bruitage', 'Disco'];

function RegieTrackPicker({ tracks, playingIds, onStart }) {
    const { t } = useTranslation();
    const [activeTag, setActiveTag] = useState('all');

    const filtered = activeTag === 'all' ? tracks : tracks.filter((track) => track.tag === activeTag);

    return (
        <div>
            <div className="tabs" role="group" aria-label="tag-filter">
                <button
                    type="button"
                    className={`btn btn-sm ${activeTag === 'all' ? 'is-active' : ''}`}
                    onClick={() => setActiveTag('all')}
                >{t('track.tag.all')}</button>
                {TAGS.map((tag) => (
                    <button
                        key={tag}
                        type="button"
                        className={`btn btn-sm ${activeTag === tag ? 'is-active' : ''}`}
                        onClick={() => setActiveTag(tag)}
                    >{t(`track.tag.${tag}`)}</button>
                ))}
            </div>
            <div className="step-list">
                {filtered.map((track) => {
                    const playing = playingIds.includes(track.id);
                    return (
                        <div key={track.id} className="step-row">
                            <span className="dot" style={{background: track.color}}/>
                            <span className="step-name">{track.name}</span>
                            <span className="pill">{t(`track.tag.${track.tag}`)}</span>
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
