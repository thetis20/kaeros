import { useState, useEffect } from 'react';

function useTracks() {
    const [tracks, setTracks] = useState([])

    function handleTrack(event) {
        setTracks(event.detail)
    }

    useEffect(() => {
        window.electronAPI.trackFetch()
        document.addEventListener('track-onchange', handleTrack);
        return () => {
            document.removeEventListener('track-onchange', handleTrack);
        }
    }, []);

    return tracks
}

export default useTracks;
