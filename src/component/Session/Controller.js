import 'react';
import {useEffect, Fragment} from 'react';
import {ChevronBarLeft, ChevronBarRight, Pause, Play} from 'react-bootstrap-icons';
import {useTranslation} from 'react-i18next';
import {white} from '../../enum/COLOR'
import useSession from '../Hook/useSession';

function Controller({display}) {
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
                case 'ArrowTop':
                    session.plus()
                    break;
                case 'ArrowBottom':
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
                    <div style={{
                        flex: 1,
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
            <ul className="list-group" style={{
                margin: '0 -1em',
                width: 280,
                borderRadius: 0,
                overflowY: 'auto'
            }}>
                {session.steps.map((step, index) =>
                    <li
                        style={{cursor: 'pointer'}}
                        onClick={() => session.toStep(index)}
                        className={'list-group-item ' + ((session.index === index) ? 'list-group-item-primary' : (session.index <= index ? '' : 'list-group-item-secondary'))}
                        key={index}
                    >
                        {step.name}
                    </li>)}
            </ul>
        </Fragment>
    );
}

export default Controller;
