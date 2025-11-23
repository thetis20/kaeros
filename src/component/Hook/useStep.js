import { useState, useEffect } from 'react';

function useStep(initialValue) {
    const [value, setValue] = useState(initialValue)

    function handler(event) {
        const value = event.detail
        if(Array.isArray(value.players)){
            value.players = value.players.join('; ')
        }
        setValue(value)
    }

    useEffect(() => {
        document.addEventListener('step-onchange', handler);
        return () => {
            document.removeEventListener('step-onchange', handler);
        }
    }, []);

    return [value, setValue]
}

export default useStep;