import 'react';
import {useEffect, Fragment} from 'react';
import {ChevronBarLeft, ChevronBarRight, Dash, Pause, Play, Plus, Recycle, Trash} from 'react-bootstrap-icons';
import {useTranslation} from 'react-i18next';
import {white} from '../../enum/COLOR'
import useSession from '../Hook/useSession';

function BattleRoyalStepController({session, step, index}) {
    const isCurrentStep = session.index === index
    if (!isCurrentStep) {
        return <li
            style={{cursor: 'pointer'}}
            onClick={() => session.toStep(index)}
            className={'list-group-item ' + ((session.index === index) ? 'list-group-item-primary' : (session.index <= index ? '' : 'list-group-item-secondary'))}
        >
            {step.name}
        </li>
    }
    const track = session.track;

    return <li
        style={{cursor: 'pointer'}}
        className={'list-group-item list-group-item-primary'}
    >
        {step.name}
        <ul style={{paddingLeft: '.5em'}}>
            {track.players.map(player => <li
                key={player.id}
                className={'list-group-item'}
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 0 0 .5em'
                }}
            >
                {player.name} : {player.score}

                <div>
                    <button
                        style={{borderRadius: 0}}
                        type="button"
                        className="btn btn-primary"
                        onClick={player.increment}
                        disabled={!player.canIncrement()}
                    >
                        <Plus/>
                    </button>
                    <button
                        style={{borderRadius: 0}}
                        type="button"
                        className="btn btn-light"
                        onClick={player.decrement}
                        disabled={!player.canDecrement()}
                    >
                        <Dash/>
                    </button>
                    {player.canDisable() &&
                        <button style={{borderRadius: 0}} type="button" className="btn btn-danger"
                                onClick={player.disable}><Trash/></button>}
                    {player.canEnable() &&
                        <button style={{borderRadius: 0}} type="button" className="btn btn-success"
                                onClick={player.enable}><Recycle/></button>}
                </div>
            </li>)}
        </ul>
    </li>
}

export default BattleRoyalStepController;
