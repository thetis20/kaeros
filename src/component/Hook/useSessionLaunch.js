import {useCallback, useRef, useState} from 'react';
import {checkWorkflowMedia} from '../../lib/mediaCheck';

// Media verification before launch is disabled: it blocked sessions whose files
// were fine. Flip back to true (or pass {checkMedia: true}) to re-enable it.
export const MEDIA_CHECK_ON_LAUNCH = false;

function useSessionLaunch({checkMedia = MEDIA_CHECK_ON_LAUNCH} = {}) {
    const [checking, setChecking] = useState(false);
    const [issues, setIssues] = useState([]);
    const checkingRef = useRef(false);

    const launch = useCallback(async (workflow) => {
        if (!checkMedia) {
            window.electronAPI.sessionPlay(workflow);
            return;
        }
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
    }, [checkMedia]);

    const dismiss = useCallback(() => {
        setIssues([]);
    }, []);

    return {launch, checking, issues, dismiss};
}

export default useSessionLaunch;
