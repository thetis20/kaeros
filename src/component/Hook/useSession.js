import { useState, useEffect } from 'react';
import Session from "../../entity/Session";

function useSession(initialValue) {
    const [value, setValue] = useState(initialValue)

    function handler(event) {
        console.log('useSession', event.detail)
        setValue(event.detail)
    }

    useEffect(() => {
        document.addEventListener('session-onchange', handler);
        return () => {
            document.removeEventListener('session-onchange', handler);
        }
    }, []);

    return value ? new Session(value) : null
}

export default useSession;