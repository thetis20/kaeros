import { useState, useEffect } from 'react';
import Session from "../../entity/Session";

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

    return value ? new Session(value, setValue) : null
}

export default useSession;