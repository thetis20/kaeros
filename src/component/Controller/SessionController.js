import 'react';
import {useEffect, Fragment, useState} from 'react';
import {IconPlayerTrackPrev, IconPlayerTrackNext, IconMinus, IconPlayerPause, IconPlayerPlay, IconPlus, IconPlayerStop} from '@tabler/icons-react';
import {useTranslation} from 'react-i18next';
import useSession from '../Hook/useSession';
import StepController from "./StepController";
import ConfirmDialog from "../Screen/ConfirmDialog";

function SessionController({display}) {
    display = display === undefined ? true : display
    const {t} = useTranslation();
    const session = useSession()
    const [showStopConfirm, setShowStopConfirm] = useState(false);
    const track = session?.track

    useEffect(() => {
        function handleKeyboard(event) {
            switch (event.key) {
                case ' ':
                    session.play()
                    break;
                case 'ArrowRight':
                    session.next()
                    break;
                case 'ArrowLeft':
                    session.previous()
                    break;
                case 'ArrowUp':
                    session.plus()
                    break;
                case 'ArrowDown':
                    session.minus()
                    break;
            }
        }

        document.addEventListener('keydown', handleKeyboard)
        return () => {
            document.removeEventListener('keydown', handleKeyboard)
        }
    }, [session]);

    if (!session || !display) {
        return null
    }

    return (
        <Fragment>
            <p style={{fontWeight: 500, fontSize: 15, margin: '0 0 12px'}}>{t('session.name')}</p>
            <div className="top-bar">
                {session.canMinus() && <button type="button" className="btn btn-icon" aria-label="minus" onClick={session.minus}><IconMinus/></button>}
                {session.hasPrevious() && <button type="button" className="btn btn-icon" aria-label="previous" onClick={session.previous}><IconPlayerTrackPrev/></button>}
                {track.canPlay() && <button type="button" className="btn btn-icon btn-accent" aria-label="play" onClick={session.play}><IconPlayerPlay/></button>}
                {track.canPause() && <button type="button" className="btn btn-icon btn-accent" aria-label="pause" onClick={session.pause}><IconPlayerPause/></button>}
                {session.hasNext() && <button type="button" className="btn btn-icon" aria-label="next" onClick={session.next}><IconPlayerTrackNext/></button>}
                {session.canPlus() && <button type="button" className="btn btn-icon" aria-label="plus" onClick={session.plus}><IconPlus/></button>}
                <button type="button" className="btn btn-icon" aria-label={t('regie.controller.stop')} onClick={() => setShowStopConfirm(true)}><IconPlayerStop/></button>
                {showStopConfirm && (
                    <ConfirmDialog
                        title={t('regie.controller.stopConfirm.title')}
                        message={t('regie.controller.stopConfirm.message')}
                        confirmLabel={t('regie.controller.stopConfirm.confirm')}
                        cancelLabel={t('regie.controller.stopConfirm.cancel')}
                        onConfirm={() => {
                            session.stop();
                            setShowStopConfirm(false);
                        }}
                        onCancel={() => setShowStopConfirm(false)}
                    />
                )}
            </div>
            <div className="step-list">
                {session.steps.map((step, index) => <StepController
                    key={step.id}
                    session={session}
                    step={step}
                    index={index}
                />)}
            </div>
        </Fragment>
    );
}

export default SessionController;
