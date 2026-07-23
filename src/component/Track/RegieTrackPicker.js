import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const TAGS = ['Musique', 'Bruitage', 'Disco'];

function RegieTrackPicker({ tracks, playingIds, onStart }) {
    const { t } = useTranslation();
    const [activeTag, setActiveTag] = useState('all');

    const filtered = activeTag === 'all' ? tracks : tracks.filter((track) => track.tag === activeTag);

    return (
        <div>
            <div className="btn-group" role="group" aria-label="tag-filter">
                <button
                    type="button"
                    className={`btn ${activeTag === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTag('all')}
                >{t('track.tag.all')}</button>
                {TAGS.map((tag) => (
                    <button
                        key={tag}
                        type="button"
                        className={`btn ${activeTag === tag ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTag(tag)}
                    >{t(`track.tag.${tag}`)}</button>
                ))}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '1em' }}>
                {filtered.map((track) => {
                    const playing = playingIds.includes(track.id);
                    return (
                        <li key={track.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75em', padding: '0.5em 0' }}>
                            <span style={{ width: '1em', height: '1em', borderRadius: '50%', background: track.color, display: 'inline-block' }}/>
                            <span style={{ flex: 1 }}>{track.name}</span>
                            <span className="badge text-bg-secondary">{t(`track.tag.${track.tag}`)}</span>
                            <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                disabled={playing}
                                onClick={() => onStart(track)}
                            >{playing ? t('track.playing') : t('track.start')}</button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default RegieTrackPicker;
