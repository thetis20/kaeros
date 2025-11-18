import { useState, useEffect } from 'react';

function useSteps(workflowId) {
    const [steps, setSteps] = useState([])

    function handleSteps(event) {
        setSteps(event.detail)
    }

    useEffect(() => {
        window.electronAPI.stepFetch(workflowId)
        document.addEventListener('step-onchange', handleSteps);
        return () => {
            document.removeEventListener('step-onchange', handleSteps);
        }
    }, [workflowId]);

    return steps
}

export default useSteps;