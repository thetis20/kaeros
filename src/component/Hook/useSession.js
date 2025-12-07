import { useState, useEffect } from 'react';
import Session from "../../entity/Session";

function useSession() {
    const [value, setValue] = useState(window.session)

    function handler(event) {
        window.session = event.detail
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