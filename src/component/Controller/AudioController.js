import 'react';
import {useEffect, Fragment, useState} from 'react';
import { v4 as uuidv4 } from 'uuid';

function AudioController() {
    const [audios, setAudios] = useState([]);

    function handleAudio(event) {
        setAudios(audios => {
            return [...audios, {
                playId : uuidv4(),
                ...event.detail
            }];
        })
    }

    function onEnded(audio) {
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
        {audios.map((audio, index) => <audio
            key={audio.playId}
            autoPlay
            src={'file://' + audio.src}
            onEnded={() => onEnded(audio)}
            controls
        ></audio>)}
    < />;
}

export default AudioController;
