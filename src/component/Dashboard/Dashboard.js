import 'react';
import {useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import Sidebar from '../Sidebar/Sidebar';
import RegieScreen from '../Screen/RegieScreen';
import MusiqueScreen from '../Screen/MusiqueScreen';
import WorkflowDashboard from './WorkflowDashboard';
import SessionCreationScreen from '../Screen/SessionCreationScreen';
import useSession from '../Hook/useSession';
import useAudios from '../Hook/useAudios';
import useSessionLaunch from '../Hook/useSessionLaunch';
import AudioController from '../Controller/AudioController';
import MediaErrorDialog from '../Screen/MediaErrorDialog';
import UnsavedChangesDialog from '../Screen/UnsavedChangesDialog';

function Dashboard() {
    const {t} = useTranslation();
    const [screen, setScreen] = useState('regie');
    const [editingWorkflowId, setEditingWorkflowId] = useState(null);
    const [pendingScreen, setPendingScreen] = useState(null);
    const guardRef = useRef(null);
    const session = useSession();
    const audios = useAudios();
    const {launch, checking, issues, dismiss} = useSessionLaunch();

    function createNew() {
        setEditingWorkflowId(null);
        setScreen('creation');
    }

    function editWorkflow(workflow) {
        setEditingWorkflowId(workflow.id);
        setScreen('creation');
    }

    function doneCreating() {
        setEditingWorkflowId(null);
        setScreen('sessions');
    }

    function requestNavigate(target) {
        if (target === screen) return;
        if (guardRef.current?.isDirty()) {
            setPendingScreen(target);
            return;
        }
        setScreen(target);
    }

    function saveAndContinue() {
        const target = pendingScreen;
        setPendingScreen(null);
        if (guardRef.current?.save()) {
            setScreen(target);
        }
    }

    function discardAndContinue() {
        setScreen(pendingScreen);
        setPendingScreen(null);
    }

    return (
        <div className="app height-full" style={{height: '100vh'}}>
            <Sidebar
                screen={screen}
                onNavigate={requestNavigate}
                sessionRunning={session !== null}
                musicPlaying={audios.length > 0}
            />
            <main style={{maxHeight: '100%', overflowY: 'auto', flex: 1}}>
                <div className="card" style={{padding: '1em', margin: '1em', display: audios.length ? undefined : 'none'}}>
                    <p style={{fontWeight: 500, margin: '0 0 .75em'}}>{t('regie.audios.title')}</p>
                    <AudioController/>
                </div>
                {issues.length > 0 && <MediaErrorDialog issues={issues} onClose={dismiss}/>}
                {screen === 'regie' && <RegieScreen onPlay={launch} checking={checking}/>}
                {pendingScreen !== null && (
                    <UnsavedChangesDialog
                        onSave={saveAndContinue}
                        onDiscard={discardAndContinue}
                        onCancel={() => setPendingScreen(null)}
                    />
                )}
                {screen === 'musique' && <MusiqueScreen guardRef={guardRef}/>}
                {screen === 'sessions' && (
                    <WorkflowDashboard
                        onCreateNew={createNew}
                        onEditWorkflow={editWorkflow}
                        onPlay={launch}
                        checking={checking}
                    />
                )}
                {screen === 'creation' && <SessionCreationScreen workflowId={editingWorkflowId} onDone={doneCreating} guardRef={guardRef}/>}
            </main>
        </div>
    );
}

export default Dashboard;
