import { useState, useEffect } from 'react';

function useWorkflows() {
    const [workflows, setWorkflows] = useState([])

    function handleWorkflow(event) {
        setWorkflows(event.detail)
    }

    useEffect(() => {
        window.electronAPI.workflowFetch()
        document.addEventListener('workflow-onchange', handleWorkflow);
        return () => {
            document.removeEventListener('workflow-onchange', handleWorkflow);
        }
    }, []);

    return workflows
}

export default useWorkflows;