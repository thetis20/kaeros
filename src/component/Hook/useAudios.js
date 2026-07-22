import { useEffect, useState } from 'react';

function useAudios() {
    const [audios, setAudios] = useState([]);

    useEffect(() => {
        function handlePlay(event) {
            const audio = event.detail;
            setAudios(current => [...current.filter(a => a.id !== audio.id), audio]);
        }
        function handleEnd(event) {
            const audio = event.detail;
            setAudios(current => current.filter(a => a.id !== audio.id));
        }
        document.addEventListener('audio-play', handlePlay);
        document.addEventListener('audio-end', handleEnd);
        return () => {
            document.removeEventListener('audio-play', handlePlay);
            document.removeEventListener('audio-end', handleEnd);
        };
    }, []);

    return audios;
}

export default useAudios;
