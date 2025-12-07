import 'react';
import {useEffect, Fragment} from 'react';
import {ChevronBarLeft, ChevronBarRight, Dash, Pause, Play, Plus} from 'react-bootstrap-icons';
import {useTranslation} from 'react-i18next';
import {white} from '../../enum/COLOR'
import useSession from '../Hook/useSession';
import StepController from "./StepController";

function SessionController({display}) {
    display = display === undefined ? true : display
    const {t} = useTranslation();
    const session = useSession()
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
            <h5>{t('session.name')}</h5>
            <div style={{width: '100%', display: 'flex', height: 150}}>
                <div style={{width: '100%', display: 'flex'}}>
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column'
                    }}>
                        <div style={{
                            height: 40,
                            width: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {session.canPlus() && <button
                                style={{
                                    fontSize: 25,
                                    border: 'none',
                                    color: white,
                                    background: 'none'
                                }}
                                onClick={session.plus}><Plus/></button>}
                        </div>
                        <div style={{
                            height: 40,
                            width: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {session.hasPrevious() && <button
                                style={{
                                    fontSize: 25,
                                    border: 'none',
                                    color: white,
                                    background: 'none'
                                }}
                                onClick={session.previous}><ChevronBarLeft/></button>}
                        </div>
                    </div>
                    <div style={{
                        flex: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {track.canPlay() && <button
                            style={{
                                fontSize: 50,
                                border: 'none',
                                color: white,
                                background: 'none'
                            }}
                            onClick={session.play}><Play/></button>}
                        {track.canPause() && <button
                            style={{
                                fontSize: 50,
                                border: 'none',
                                color: white,
                                background: 'none'
                            }}
                            onClick={session.pause}><Pause/></button>}
                    </div>
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column'
                    }}>
                        <div style={{
                            height: 40,
                            width: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {session.canMinus() && <button
                                style={{
                                    fontSize: 25,
                                    border: 'none',
                                    color: white,
                                    background: 'none'
                                }}
                                onClick={session.minus}><Dash/></button>}
                        </div>
                        <div style={{
                            height: 40,
                            width: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {session.hasNext() && <button
                                style={{
                                    fontSize: 25,
                                    border: 'none',
                                    color: white,
                                    background: 'none'
                                }}
                                onClick={session.next}><ChevronBarRight/></button>}
                        </div>
                    </div>
                </div>
            </div>
            <ul className="list-group" style={{
                margin: '0 -1em',
                width: 280,
                borderRadius: 0,
                overflowY: 'auto'
            }}>
                {session.steps.map((step, index) =><StepController
                    key={step.id}
                    session={session}
                    step={step}
                    index={index}
                />)}
            </ul>
        </Fragment>
    );
}

export default SessionController;
