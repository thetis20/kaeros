import {useEffect} from 'react';

function useNavigationGuard(guardRef, {isDirty, save}) {
    useEffect(() => {
        if (!guardRef) return undefined;
        const guard = {isDirty, save};
        guardRef.current = guard;
        return () => {
            // only clear our own guard: the next screen may already have set its own
            if (guardRef.current === guard) guardRef.current = null;
        };
    });
}

export default useNavigationGuard;
