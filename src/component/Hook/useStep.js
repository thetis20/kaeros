import { useState, useEffect } from 'react';

function useStep(initialValue) {
    const [value, setValue] = useState(initialValue)

    function handler(event) {
        setValue(event.detail)
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