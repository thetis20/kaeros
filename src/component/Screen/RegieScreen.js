import 'react';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {IconChevronDown, IconChevronUp} from '@tabler/icons-react';
import useWorkflows from '../Hook/useWorkflows';
import useSession from '../Hook/useSession';
import useAudios from '../Hook/useAudios';
import useTracks from '../Hook/useTracks';
import useTags from '../Hook/useTags';
import SessionController from '../Controller/SessionController';
import RegieLiveController from './RegieLiveController';
import RegieTrackPicker from '../Track/RegieTrackPicker';

function RegieSessionCard({workflow}) {
    const {t} = useTranslation();

    function start() {
        window.electronAPI.sessionPlay(workflow);
    }

    return (
        <div className="workflow-card">
            <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10}}>
                <div className="color-chip" style={{background: workflow.color}}/>
                <p style={{fontSize: 13, fontWeight: 500, margin: 0, flex: 1}}>{workflow.name}</p>
            </div>
            <button className="btn btn-accent" style={{width: '100%'}} onClick={start}>{t('workflow.play')}</button>
        </div>
    );
}

function RegieScreen() {
    const {t} = useTranslation();
    const workflows = useWorkflows();
    const session = useSession();
    const audios = useAudios();
    const tracks = useTracks();
    const tags = useTags();
    const [collapsed, setCollapsed] = useState(false);

    function toggleCollapsed() {
        setCollapsed((current) => !current);
    }

    function startTrack(track) {
        document.dispatchEvent(new CustomEvent('audio-play', {detail: track}));
    }

    return (
        <div className="content">
            <p className="screen-title">{t('regie.title')}</p>

            <div className="card" style={{marginBottom: 16}}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <p style={{fontSize: 12, color: 'var(--text-secondary)', margin: 0}}>{t('regie.session.label')}</p>
                    <button
                        type="button"
                        className="btn btn-icon"
                        aria-label={collapsed ? t('regie.session.expand') : t('regie.session.collapse')}
                        onClick={toggleCollapsed}
                    >
                        {collapsed ? <IconChevronDown/> : <IconChevronUp/>}
                    </button>
                </div>
                {!collapsed && (
                    <div style={{marginTop: 12}}>
                        {session ? (
                            <div className="two-col">
                                <div>
                                    <SessionController/>
                                </div>
                                <div className="card">
                                    <RegieLiveController/>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className="screen-sub" style={{margin: '0 0 12px'}}>{t('regie.empty.title')}</p>
                                <div className="grid grid-cards">
                                    {workflows.map((workflow) => <RegieSessionCard key={workflow.id} workflow={workflow}/>)}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="card">
                <p style={{fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 8px'}}>{t('regie.music.title')}</p>
                <RegieTrackPicker tracks={tracks} tags={tags} playingIds={audios.map((audio) => audio.id)} onStart={startTrack}/>
            </div>
        </div>
    );
}

export default RegieScreen;
