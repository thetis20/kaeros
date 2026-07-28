import 'react';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ChevronDown, ChevronUp} from 'react-bootstrap-icons';
import useWorkflows from '../Hook/useWorkflows';
import useSession from '../Hook/useSession';
import SessionController from '../Controller/SessionController';
import RegieLiveController from './RegieLiveController';

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
    const [collapsed, setCollapsed] = useState(false);

    function toggleCollapsed() {
        setCollapsed((current) => !current);
    }

    return (
        <div style={{padding: '1em'}}>
            <h1>{t('regie.title')}</h1>

            <div className="card" style={{padding: '1em', marginBottom: '1em'}}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <p style={{fontWeight: 500, margin: 0}}>{t('regie.session.label')}</p>
                    <button
                        type="button"
                        className="btn btn-light"
                        aria-label={collapsed ? t('regie.session.expand') : t('regie.session.collapse')}
                        onClick={toggleCollapsed}
                    >
                        {collapsed ? <ChevronDown/> : <ChevronUp/>}
                    </button>
                </div>
                {!collapsed && (
                    <div style={{marginTop: '1em'}}>
                        {session ? (
                            <div style={{display: 'flex', gap: '1em'}}>
                                <div style={{flex: 1}}>
                                    <SessionController/>
                                </div>
                                <div className="card" style={{flex: 1, padding: '1em'}}>
                                    <RegieLiveController/>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p>{t('regie.empty.title')}</p>
                                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1em'}}>
                                    {workflows.map((workflow) => <RegieSessionCard key={workflow.id} workflow={workflow}/>)}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default RegieScreen;
