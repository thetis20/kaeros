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

    function handleAudio(event) {
        setAudios(audios => {
            return [...audios, {
                playId: uuidv4(),
                ...event.detail
            }];
        })
    }

    function onStop(audio) {
        setAudios(audios => {
            return audios.filter(a => a.playId !== audio.playId);
        })
    }

    useEffect(() => {
        document.addEventListener('audio-play', handleAudio);
        return () => {
            document.removeEventListener('audio-play', handleAudio);
        }
    }, []);

    return <>
        {audios.map((audio, index) => <AudioControllerItem key={audio.playId} audio={audio} onStop={onStop}/>)}
    < />;
}

export default AudioController;
