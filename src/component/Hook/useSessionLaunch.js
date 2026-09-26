import {useCallback, useRef, useState} from 'react';
import {checkWorkflowMedia} from '../../lib/mediaCheck';

function useSessionLaunch() {
    const [checking, setChecking] = useState(false);
    const [issues, setIssues] = useState([]);
    const checkingRef = useRef(false);

    const launch = useCallback(async (workflow) => {
        if (checkingRef.current) return;
        checkingRef.current = true;
        setChecking(true);

        try {
            const results = await checkWorkflowMedia(workflow.id);
            const faulty = results.filter((result) => result.code !== 'ok');
            if (faulty.length) {
                setIssues(faulty);
            } else {
                window.electronAPI.sessionPlay(workflow);
            }
        } catch {
            // The check itself failed: files can't be guaranteed, so surface a
            // problem rather than silently launching a possibly broken session.
            setIssues([{
                id: 'session-launch-check-error',
                kind: 'step',
                name: workflow?.name || '',
                src: undefined,
                code: 'check-failed',
            }]);
        } finally {
            checkingRef.current = false;
            setChecking(false);
        }
    }, []);

    const dismiss = useCallback(() => {
        setIssues([]);
    }, []);

    return {launch, checking, issues, dismiss};
}

export default useSessionLaunch;
