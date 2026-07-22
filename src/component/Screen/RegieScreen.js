import 'react';
import {useTranslation} from 'react-i18next';
import useWorkflows from '../Hook/useWorkflows';
import useSession from '../Hook/useSession';
import SessionController from '../Controller/SessionController';
import AudioController from '../Controller/AudioController';

function RegieSessionCard({workflow}) {
    const {t} = useTranslation();

    function start() {
        window.electronAPI.sessionPlay(workflow);
    }

    return (
        <div className="card" style={{padding: '1em'}}>
            <p style={{fontWeight: 500, margin: '0 0 .75em'}}>{workflow.name}</p>
            <button className="btn btn-primary" style={{width: '100%'}} onClick={start}>{t('workflow.play')}</button>
        </div>
    );
}

function RegieScreen() {
    const {t} = useTranslation();
    const workflows = useWorkflows();
    const session = useSession();

    if (session) {
        return (
            <div style={{padding: '1em'}}>
                <h1>{t('regie.title')}</h1>
                <SessionController/>
                <AudioController/>
            </div>
        );
    }

    return (
        <div style={{padding: '1em'}}>
            <h1>{t('regie.title')}</h1>
            <p>{t('regie.empty.title')}</p>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1em'}}>
                {workflows.map((workflow) => <RegieSessionCard key={workflow.id} workflow={workflow}/>)}
            </div>
        </div>
    );
}

export default RegieScreen;
