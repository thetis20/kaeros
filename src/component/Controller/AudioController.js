import 'react';
import {useEffect} from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import {IconPlayerStop} from '@tabler/icons-react';
import useAudios from '../Hook/useAudios';

function AudioControllerItem({audio, onStop}) {
    return <div className="audio-row" style={{flexDirection: 'column', alignItems: 'stretch'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
            <span className="dot" style={{background: audio.color || 'var(--accent)', marginRight:'.5em'}}/>
            <span style={{flex: 1}}>{audio.name}</span>
            <button className="btn btn-icon" aria-label="stop" onClick={() => onStop(audio)}>
                <IconPlayerStop/>
            </button>
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
