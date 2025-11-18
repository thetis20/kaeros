import { useState, useEffect, useCallback, Fragment } from 'react';
import { ChevronLeft, Pause, Pen, Play, Square, SquareFill, Trash } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';

function Item({ audio, onClick, onEnded }) {
    const { t } = useTranslation();

    return <li style={{
        width: 150,
        height: 150,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        cursor: 'pointer',
        flexDirection: 'column',
        backgroundColor: audio.color,
        position: 'relative',
    }} onClick={() => onClick(audio)}>
        <h6>{audio.name}</h6>
        {audio.playing && <SquareFill style={{ position: 'absolute', right: '1em', top: '1em' }} />}
        {audio.playing && <audio autoPlay src={'file://' + audio.src} onEnded={() => onEnded(audio)}></audio>}
    </li>
}

function AudioDashboard({ folderId }) {
    const { t } = useTranslation();
    const [audios, setAudios] = useState([])
    const [mode, setMode] = useState('play')

    function handleAudio(event) {
        setAudios(event.detail)
    }

    function create() {
        window.electronAPI.audioOpen(folderId)
    }

    function edit(audio) {
        window.electronAPI.audioOpen(folderId, audio)
    }

    function remove(audio) {
        window.electronAPI.audioRemove(folderId, audio.id)
    }

    function switchAudio(audio) {
        setAudios(audios => audios.map(a => {
            if (a.id === audio.id) {
                return { ...a, playing: !audio.playing }
            }
            return a
        }))
    }

    useEffect(() => {
        window.electronAPI.audioFetch(folderId)
        document.addEventListener('audio-onchange', handleAudio);
        return () => {
            document.removeEventListener('audio-onchange', handleAudio);
        }
    }, []);

    const onClick = useCallback((audio) => {
        switch (mode) {
            case 'play':
                switchAudio(audio)
                break;
            case 'edit':
                edit(audio)
                break;
            case 'move':
                move(audio)
                break;
            case 'remove':
                remove(audio)
                break;
            default:
                break;
        }
    }, [mode]);

    return (
        <Fragment>
            <div style={{ marginTop: 30, display: 'flex', justifyContent: 'space-between' }} >
                <div className="btn-group" role="group" aria-label="Mode">
                    <button type="button" className={`btn ${mode === 'play' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('play')}>Play</button>
                    <button type="button" className={`btn ${mode === 'edit' ? 'btn-warning' : 'btn-secondary'}`} onClick={() => setMode('edit')}>Edit</button>
                    <button type="button" className={`btn ${mode === 'move' ? 'btn-warning' : 'btn-secondary'}`} onClick={() => setMode('move')}>Move</button>
                    <button type="button" className={`btn ${mode === 'remove' ? 'btn-danger' : 'btn-secondary'}`} onClick={() => setMode('remove')}>Delete</button>
                </div>
                {mode === 'edit' && <button className="btn btn-primary" onClick={create}>{t('audio.create')}</button>}
            </div>
            <ul style={{
                listStyle: 'none',
                padding: 0,
                gap: 30,
                display: 'flex',
                flexWrap: 'wrap',
                marginTop: 30
            }}>
                {audios.map((audio) => <Item key={audio.id} audio={audio} onClick={onClick} onEnded={switchAudio} />)}
            </ul>
        </Fragment>
    );
}

export default AudioDashboard;
