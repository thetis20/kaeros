import 'react';
import {IconMinus, IconPlus, IconRecycle, IconTrash} from '@tabler/icons-react';
import useSession from '../Hook/useSession';

function BattleRoyalStepController({session, step, index}) {
    const isCurrentStep = session.index === index;
    const isDone = session.index > index;
    if (!isCurrentStep) {
        return <div
            className={`step-row ${isDone ? 'done' : ''}`}
            style={{cursor: 'pointer'}}
            onClick={() => session.toStep(index)}
        >
            <span className="step-name">{step.name}</span>
        </div>
    }
    const track = session.track;

    return <div className="step-row current" style={{flexDirection: 'column', alignItems: 'stretch'}}>
        <span className="step-name">{step.name}</span>
        <div className="step-list" style={{marginTop: 8}}>
            {track.players.map(player => (
                <div key={player.id} className={`player-row ${!player.enabled ? 'disabled' : ''}`}>
                    <span style={{flex: 1, fontSize: 14}}>{player.name}</span>
                    <span style={{fontSize: 14, fontWeight: 500, minWidth: 20, textAlign: 'center'}}>{player.score}</span>
                    <button type="button" className="btn btn-icon" onClick={player.decrement} disabled={!player.canDecrement()} aria-label="decrement">
                        <IconMinus/>
                    </button>
                    <button type="button" className="btn btn-icon" onClick={player.increment} disabled={!player.canIncrement()} aria-label="increment">
                        <IconPlus/>
                    </button>
                    {player.canDisable() &&
                        <button type="button" className="btn btn-icon" onClick={player.disable} aria-label="disable"><IconTrash/></button>}
                    {player.canEnable() &&
                        <button type="button" className="btn btn-icon" onClick={player.enable} aria-label="enable"><IconRecycle/></button>}
                </div>
            ))}
        </div>
    </div>
}

export default BattleRoyalStepController;
