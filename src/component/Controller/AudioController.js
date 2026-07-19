import 'react';
import {useEffect, Fragment, useState} from 'react';
import {v4 as uuidv4} from 'uuid';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import {SquareFill} from "react-bootstrap-icons";

function AudioControllerItem({audio, onStop}) {
    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    }}>
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%'
        }}>
            {audio.name}
            <button onClick={() => onStop(audio)} style={{
                marginLeft: '1em',
                background: 'none',
                color: 'white',
                border: '1px solid white',
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1em'
            }}>stop <SquareFill/></button>
        </div>
        <AudioPlayer
            autoPlay
            src={'file://' + audio.src}
            onEnded={() => onStop(audio)}
        />
    </div>
}

function AudioController() {
    const [audios, setAudios] = useState([]);

    function handleAudioPlay(event) {
        const audio = event.detail
        setAudios(audios => {
            return [...audios.filter(a => a.id !== audio.id), audio];
        })
        window.electronAPI.audioPlay(event.detail.folderId, event.detail.id)
    }

    function handleAudioEnd(event) {
        onStop(event.detail)
    }

    function onStop(audio) {
        setAudios(audios => {
            return audios.filter(a => a.id !== audio.id);
        })
        window.electronAPI.audioEnd(audio.folderId, audio.id)
    }

    useEffect(() => {
        document.addEventListener('audio-play', handleAudioPlay);
        document.addEventListener('audio-end', handleAudioEnd);
        return () => {
            document.removeEventListener('audio-play', handleAudioPlay);
            document.removeEventListener('audio-end', handleAudioEnd);
        }
    }, []);

    return <>
        {audios.map((audio) => <AudioControllerItem key={audio.id} audio={audio} onStop={onStop}/>)}
    </>;
}

export default AudioController;
