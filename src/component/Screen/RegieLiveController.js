import 'react';
import {useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {IconMinus, IconPlus} from '@tabler/icons-react';
import useSession from '../Hook/useSession';
import BattleRoyalStepController from '../Controller/BattleRoyalStepController';

const TYPES = ['image', 'dubbing-video', 'time', 'battle-royal'];

function formatCountdown(seconds) {
    const total = Math.max(0, seconds || 0);
    const minutes = Math.floor(total / 60);
    const remaining = total % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
}

function RegieLiveController() {
    const {t} = useTranslation();
    const session = useSession();
    const [activeType, setActiveType] = useState(session ? session.track.type : null);

    useEffect(() => {
        if (session) {
            setActiveType(session.track.type);
        }
    }, [session && session.track.type]);

    if (!session) {
        return null;
    }

    function renderPanel() {
        if (activeType === 'image') {
            return <div className="preview-box">{t('regie.controller.imagePreview')}</div>;
        }
        if (activeType === 'dubbing-video') {
            return (
                <>
                    <div className="preview-box">{t('regie.controller.dubbingPreview')}</div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '.5em'}}>
                        <span>00:00</span>
                        <input type="range" min="0" max="100" defaultValue="0" disabled/>
                        <span>00:00</span>
                    </div>
                </>
            );
        }
        if (activeType === 'time') {
            if (session.track.type !== 'time') {
                return <p>{t('regie.tabs.inactive')}</p>;
            }
            const track = session.track;
            return (
                <div style={{textAlign: 'center'}}>
                    <p>{t('regie.controller.impro', {current: track.count, total: track.impro})}</p>
                    <p className="time-display">{formatCountdown(track.time)}</p>
                    <div style={{display: 'flex', justifyContent: 'center', gap: '1em'}}>
                        <button
                            type="button"
                            className="btn btn-icon"
                            aria-label={t('regie.controller.improPrevious')}
                            onClick={session.minus}
                            disabled={!session.canMinus()}
                        ><IconMinus/></button>
                        <button
                            type="button"
                            className="btn btn-icon"
                            aria-label={t('regie.controller.improNext')}
                            onClick={session.plus}
                            disabled={!session.canPlus()}
                        ><IconPlus/></button>
                    </div>
                </div>
            );
        }
        if (activeType === 'battle-royal') {
            if (session.track.type !== 'battle-royal') {
                return <p>{t('regie.tabs.inactive')}</p>;
            }
            return <BattleRoyalStepController session={session} step={session.steps[session.index]} index={session.index}/>;
        }
        return null;
    }

    return (
        <div>
            <div className="tabs">
                {TYPES.map((type) => (
                    <button
                        key={type}
                        type="button"
                        className={`btn btn-sm ${activeType === type ? 'is-active' : ''}`}
                        onClick={() => setActiveType(type)}
                    >{t(`regie.tabs.${type}`)}</button>
                ))}
            </div>
            <div id="regie-controller">
                {renderPanel()}
            </div>
        </div>
    );
}

export default RegieLiveController;
