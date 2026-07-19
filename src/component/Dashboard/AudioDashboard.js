import {useState, useEffect, useCallback, Fragment} from 'react';
import {ChevronLeft, Pause, Pen, Play, PlayFill, Square, SquareFill, Trash} from 'react-bootstrap-icons';
import {useTranslation} from 'react-i18next';

function Item({audio, onClick}) {

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
        {audio.playing && <PlayFill style={{
            position: 'absolute',
            right: '0.5em',
            top: '0.5em',
        }}/>}
        <h6>{audio.name}</h6>
    </li>
}

function AudioDashboard({folderId}) {
    const {t} = useTranslation();
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

    function switchAudio(audio, folderId) {
        if (audio.playing) {
            document.dispatchEvent(new CustomEvent('audio-end', {
                detail: {
                    ...audio,
                    folderId
                }
            }))
        } else {
            document.dispatchEvent(new CustomEvent('audio-play', {
                detail: {
                    ...audio,
                    folderId
                }
            }))
        }
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
                switchAudio(audio, folderId)
                break;
            case 'edit':
                edit(audio)
                break;
            case 'remove':
                remove(audio)
                break;
            default:
                break;
        }
    }, [mode, folderId]);

    return (
        <Fragment>
            <div style={{marginTop: 30, display: 'flex', justifyContent: 'space-between'}}>
                <div className="btn-group" role="group" aria-label="Mode">
                    <button type="button" className={`btn ${mode === 'play' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setMode('play')}>Play
                    </button>
                    <button type="button" className={`btn ${mode === 'edit' ? 'btn-warning' : 'btn-secondary'}`}
                            onClick={() => setMode('edit')}>Edit
                    </button>
                    <button type="button" className={`btn ${mode === 'remove' ? 'btn-danger' : 'btn-secondary'}`}
                            onClick={() => setMode('remove')}>Delete
                    </button>
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
                {audios.map((audio) => <Item key={audio.id} audio={audio} onClick={onClick} onEnded={switchAudio}/>)}
            </ul>
        </Fragment>
    );
}

export default AudioDashboard;
