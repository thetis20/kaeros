import 'react';
import {useEffect} from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import {SquareFill} from "react-bootstrap-icons";
import useAudios from '../Hook/useAudios';

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
    const audios = useAudios();

    function onStop(audio) {
        document.dispatchEvent(new CustomEvent('audio-end', {detail: audio}));
    }

    useEffect(() => {
        function notifyPlay(event) {
            window.electronAPI.trackPlay(event.detail.id);
        }
        function notifyEnd(event) {
            window.electronAPI.trackEnd(event.detail.id);
        }
        document.addEventListener('audio-play', notifyPlay);
        document.addEventListener('audio-end', notifyEnd);
        return () => {
            document.removeEventListener('audio-play', notifyPlay);
            document.removeEventListener('audio-end', notifyEnd);
        };
    }, []);

    return <>
        {audios.map((audio) => <AudioControllerItem key={audio.id} audio={audio} onStop={onStop}/>)}
    </>;
}

export default AudioController;
