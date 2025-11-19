import { useState, useEffect } from 'react';
import ImageTrack from '../../entity/ImageTrack'

function useSession(initialValue) {
    const [value, setValue] = useState(initialValue)

    function handler(event) {
        setValue(event.detail)
    }

    useEffect(() => {
        window.electronAPI.sessionFetch()
        document.addEventListener('session-onchange', handler);
        return () => {
            document.removeEventListener('session-onchange', handler);
        }
    }, []);

    if (value?.track) {
        switch (value.track.type) {
            case 'image':
                value.track = new ImageTrack(value.track)
        }
    }

    return value
}

export default useSession;