import 'react';
import {useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {IconMinus, IconPlus, IconPlayerPlay, IconPlayerPause} from '@tabler/icons-react';
import useSession from '../Hook/useSession';
import BattleRoyalStepController from '../Controller/BattleRoyalStepController';

const TYPES = ['image', 'dubbing-video', 'time', 'battle-royal'];

function formatCountdown(seconds) {
    const total = Math.max(0, seconds || 0);
    const minutes = Math.floor(total / 60);
    const remaining = Math.round(total % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
}

function RegieLiveController() {
    const {t} = useTranslation();
    const session = useSession();

    if (!session) {
        return null;
    }

    function renderPanel() {
        if (session.track.type === 'image') {
            return <div className="preview-box">{t('regie.controller.imagePreview')}</div>;
        }
        if (session.track.type === 'dubbing-video') {
            const track = session.track;
            const percent = track.duration ? (track.currentTime / track.duration) * 100 : 0;
            return (
                <>
                    <div className="preview-box">{t('regie.controller.dubbingPreview')}</div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '.5em'}}>
                        <span>{formatCountdown(track.currentTime)}</span>
                        <input type="range" min="0" max="100" value={percent} disabled/>
                        <span>{formatCountdown(track.duration)}</span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'center', gap: '1em'}}>
                        <button
                            type="button"
                            className="btn btn-icon"
                            aria-label={track.paused ? t('regie.controller.play') : t('regie.controller.pause')}
                            onClick={track.paused ? session.play : session.pause}
                        >{track.paused ? <IconPlayerPlay/> : <IconPlayerPause/>}</button>
                    </div>
                </>
            );
        }
        if (session.track.type === 'time') {
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
        if (session.track.type === 'battle-royal') {
            return <BattleRoyalStepController session={session} step={session.steps[session.index]} index={session.index}/>;
        }
        return null;
    }

    return (
        <div>
            <div id="regie-controller">
                {renderPanel()}
            </div>
        </div>
    );
}

export default RegieLiveController;
